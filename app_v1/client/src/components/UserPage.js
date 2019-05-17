import React, { Component } from 'react';
import './UserPage.css';
import { post } from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class UserPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            person_id: '',
            userName: '',
            study_name: '' ,
            study_type: '',
            end_date: '',
            joinStudyArray: '' // 한 사람이 가입한 study 배열
        }
    }

    componentWillMount() {
        // setTimeout(()=>{
        //     this.getUserNameSession();
        // },800);
        this.getUserNameSession();
    }

    componentDidMount() {
        // setTimeout(()=>{
        //     this.getUserNameSession();
        // },800);
        this.getUserNameSession();
    
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
    
    render() {
        return(
            <div className="main_UserP">
                <div style={{marginTop: 10}} className = "userP_container">
                    <div className="userP_label">
                        <div className="userP_page_label">{this.state.userName} 님의 Page</div>
                        <div className="userP_current_study_label">
                            -현재 가입 중인 Study List
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