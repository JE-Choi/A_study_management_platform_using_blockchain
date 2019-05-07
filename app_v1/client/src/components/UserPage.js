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
            study_period: '',
            joinStudyArray: '' // 한 사람이 가입한 study 배열
        }
    }

    componentWillMount() {
        this.getUserNameSession();
    }

    componentDidMount() {
        this.getUserNameSession();

        this.callDBStudyInfo()
        .then(res => {
            this.setState ({
                person_id: res[0].person_id,
                userName: res[0].study_name,
                study_name: res[0].study_name,
                study_type: res[0].study_type,
                study_period: res[0].study_period
            });
        }).catch(err => console.log(err));
    }

    callDBStudyInfo = async () => {
        const url = '/api/myPage/joinStudy';

        post(url,  {
            person_id: sessionStorage.getItem("loginInfo")
        }).then((res)=>{
            this.setState({joinStudyArray: res.data});
        })
    }

    // session 불러오기
    getUserNameSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
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
                                            study_period={c.study_period}
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
    
    render() {
        return (
            <div className="current_study_item">
                <div>{this.props.study_name}</div>
                - <span>{this.props.study_type}</span>
                <br/>
                <span>{this.props.study_period} 주</span>
            </div>
        )
    }
}

export default UserPage;