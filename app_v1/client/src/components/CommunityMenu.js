import React, { Component } from 'react';
import './CommunityMenu.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import AboutMembers from './AboutMembers';
import AboutNoticeboard from './AboutNoticeboard';
import CommunitySchedule from './CommunitySchedule';
import AttendanceCheck from './AttendanceCheck';
import AboutQuiz from './AboutQuiz';
import CoinManagement from './CoinManagement';

class CommunityMenu extends Component {
    componentDidMount(){
        this.setEnterStudyidSession();
    }

    // userName session 저장
    setEnterStudyidSession = () => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("enterStudyid", this.props.match.params.id);
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    contractReloads(){
        setTimeout(function() { 
          window.location.reload();
        }, 100);
    }
    
    render() {
        return (
            <Router>
                <div className="main_communityMenu">
                    <div style={{marginTop: 10}} className = "communityMenu_container">
                        <nav className="communityMenuBar_wrapper">
                            <ul className="communityMenuBar_nav">
                                <li>
                                    <Link to={'/community/'+this.props.match.params.id+'/joinMembers'} className="community_nav_link">스터디 멤버</Link>
                                </li>
                                <li>
                                    <Link to={'/community/'+this.props.match.params.id+'/noticeboard'} className="community_nav_link">게시판</Link>
                                </li>
                                <li>
                                    <Link to={'/community/'+this.props.match.params.id+'/communitySchedule'} className="community_nav_link">Schedule</Link>
                                </li>
                                <li>
                                    <Link to={'/community/'+this.props.match.params.id+'/attendanceCheck'} onClick={this.contractReloads} className="community_nav_link">출석 체크</Link>
                                </li>
                                <li>
                                    <Link to={'/community/'+this.props.match.params.id+'/aboutQuiz'} onClick={this.contractReloads} className="community_nav_link">퀴즈 점수</Link>
                                </li>
                                <li>
                                <Link to={'/community/'+this.props.match.params.id+'/coinManagement'} onClick={this.contractReloads} className="community_nav_link">코인 관리</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="clear"></div>
                    <div style={{marginTop: 10}} className = "communityMenu_container">
                        <div className = "communityMenuBar_switch">
                            <Switch>
                                <Route exact path='/community/:id/joinMembers' component = { AboutMembers } />
                                <Route exact path='/community/:id/noticeboard' component = { AboutNoticeboard } />
                                <Route exact path='/community/:id/communitySchedule' component = { CommunitySchedule } />
                                <Route exact path='/community/:id/attendanceCheck' component = { AttendanceCheck } />
                                <Route exact path='/community/:id/aboutQuiz' component = { AboutQuiz } />
                                <Route exact path='/community/:id/aboutQuiz/:submenu' component = { AboutQuiz } />
                                <Route exact path='/community/:id/coinManagement' component = { CoinManagement } />
                                <Route exact path='/community/:id' component = { CommunitySchedule } />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default CommunityMenu;