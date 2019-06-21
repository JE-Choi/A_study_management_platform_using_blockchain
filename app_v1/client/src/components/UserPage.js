import React, { Component } from 'react';
import './UserPage.css';
import { post } from 'axios';
import { Link } from 'react-router-dom';
import $ from 'jquery';

class UserPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            person_id: '',
            userName: '',
            study_name: '' ,
            study_type: '',
            end_date: '',
            joinStudyArray: '', // 한 사람이 가입한 study 배열
            showStudyListIdx: 1, // 현재 가입 중과 종료 중인 Study 판별
            showStudyMsg: '종료된 Study 보기' 
        }
    }

    componentWillMount() {
        // 사용자 이름 session 불러오기
        this.getUserNameSession();
    }

    componentDidMount() {
        // 사용자 이름 session 불러오기
        this.getUserNameSession();
    
        // myPage에서 해당 사용자가 가입한 스터디 불러오기
        this.callDBStudyInfo()
        .then(res => {
            this.setState ({
                person_id: res[0].person_id,
                userName: res[0].study_name,
                study_name: res[0].study_name,
                study_type: res[0].study_type,
                end_date: res[0].end_date
            });
        }).catch(err => {
            
        });
    }

    // myPage에서 해당 사용자가 가입한 스터디 불러오기
    callDBStudyInfo = async () => {
        const url = '/api/myPage/joinStudy';

        post(url,  {
            person_id: sessionStorage.getItem("loginInfo")
        }).then((res)=>{
            this.setState({joinStudyArray: res.data});
        })
    }

    // 사용자 이름 session 불러오기
    getUserNameSession = async () =>{
            if (typeof(Storage) !== "undefined") {
                await this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
            } else {
                console.log("Sorry, your browser does not support Web Storage...");
            }
    }

    // 버튼에 따라 현재 가입 중인 Study, 종료된 Study 토글
    showStudyLists = () => {
        // 현재 가입 중인 Study List를 보여주는 경우
        if (this.state.showStudyListIdx === 0) {
            $('.userP_current_study_label').text('현재 가입 중인 Study 보기');

            this.setState ({
                showStudyListIdx: 1,
                showStudyMsg: '종료된 Study'
            })
        }
        // 종료된 Study List를 보여주는 경우
        else if(this.state.showStudyListIdx === 1){
            $('.userP_current_study_label').text('종료된 Study 보기');

            this.setState ({
                showStudyListIdx: 0,
                showStudyMsg: '현재 가입 중인 Study'
            })
        }
    }
    
    render() {
        return(
            <div className="main_UserP">
                <div style={{marginTop: 10}} className = "userP_container">
                    <div className="userP_label">
                        <div className="userP_page_label">{this.state.userName} 님의 Page</div>
                        <div className="userP_current_study_label">
                            현재 가입 중인 Study
                        </div>
                        <div className="list_toggle_btn_div">
                            <input type="button" onClick = {this.showStudyLists} className="btn btn-outline-danger" id="end_study_list_btn" value={this.state.showStudyMsg}/>
                        </div>
                    </div>
                    <div className="userP_box">
                        {this.state.joinStudyArray ? this.state.joinStudyArray.map(c => {
                                return (
                                    <Link to={'/community/' + c.s_id} className="communityMenu">
                                        <JoinMyStudyInfo 
                                            study_name={c.study_name}
                                            study_type={c.study_type}
                                            end_date={c.end_date}
                                        />
                                    </Link>
                                )
                            })
                        : ""}
                    </div>
                </div>
            </div>
        );
    }
}

class JoinMyStudyInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            end_date_view: ''
        }
    }
    componentDidMount(){
        let end_date = new Date(this.props.end_date);

        let e_year = String(end_date.getFullYear());
        let e_month = String(end_date.getMonth()+1);
        let e_date = String(end_date.getDate());
        let end_date_view = e_year+'년 '+e_month+'월 '+e_date+'일';
        this.setState({
            end_date_view: end_date_view
        });
    }
    render() {
        return (
            <div className="current_study_item">
                <div>{this.props.study_name}</div>
                - <span>{this.props.study_type}</span>
                <br/>
                <span>종료 날짜: {this.state.end_date_view}</span>
            </div>
        )
    }
}

export default UserPage;