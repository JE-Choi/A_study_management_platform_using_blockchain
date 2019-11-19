import React, { Component } from 'react';
import './style.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import AboutMembers from '../AboutMembers';
import alert from '../../utils/Alert';

class RecruitmentCommunityMenu extends Component {
    componentDidMount = () =>{
        this.setEnterStudyidSession();
        this.recruitmentConfirm();
    }
    // 모집 중인 스터디 커뮤니티 안내 메세지
    recruitmentConfirm = () => {
        alert.confirm('','모집 중인 스터디는 기능이 일부 제한됩니다. 스터디 모집을 완료해주세요.');
    }

    // userName session 저장
    setEnterStudyidSession = async() => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("enterStudyid", this.props.match.params.id);
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    render() {
        return (
            <Router>
                <div className="main_communityMenu">
                    <div className="clear"></div>
                    <div style={{marginTop: 10}} className = "communityMenu_container">
                        <div className = "communityMenuBar_switch">
                            <Switch>
                                <Route exact path='/recruitment_community/:id' component = { AboutMembers } />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default RecruitmentCommunityMenu;