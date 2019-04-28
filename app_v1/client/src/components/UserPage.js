import React, { Component } from 'react';
import './UserPage.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class UserPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            userName: ''
        }
    }

    componentWillMount() {
        this.getUserNameSession();
    }

    // session 불러오기
    getUserNameSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }
    
    render(){
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
                        <Link to={'/communityMenu'}  className="communityMenu">
                            <div className="current_study_item1">
                                <span>Toeic 파이팅</span>
                                <br/>
                                <span>(4월1일 ~ 6월30일)</span>
                            </div>
                        </Link>
                        <div className="current_study_item2">
                            <span>Toeic 파이팅</span>
                            <br/>
                            <span>(4월1일 ~ 6월30일)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default UserPage;