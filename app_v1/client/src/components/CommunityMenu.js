import React, { Component } from 'react';
import './CommunityMenu.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Noticeboard from './Noticeboard';
import CommunitySchedule from './CommunitySchedule';
import AttendanceCheck from './AttendanceCheck';
import CoinManagement from './CoinManagement';

class CommunityMenu extends Component {
    render() {
        return (
            <Router>
                <div className="main_communityMenu">
                    <div style={{marginTop: 10}} className = "communityMenu_container">
                        <nav className="communityMenuBar_wrapper">
                            <ul className="communityMenuBar_nav">
                                <li>
                                    <Link to={'/noticeboard'} className="community_nav_link">게시판</Link>
                                </li>
                                <li>
                                    <Link to={'/communitySchedule'} className="community_nav_link">Schedule</Link>
                                </li>
                                <li>
                                    <Link to={'/attendanceCheck'} className="community_nav_link">출석 체크</Link>
                                </li>
                                <li>
                                    <Link to={'/coinManagement'} className="community_nav_link">코인 관리</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="clear"></div>
                    <div style={{marginTop: 10}} className = "communityMenu_container">
                        <div className = "communityMenuBar_switch">
                            <Switch>
                                <Route exact path='/noticeboard' component = { Noticeboard } />
                                <Route exact path='/communitySchedule' component = { CommunitySchedule } />
                                <Route exact path='/attendanceCheck' component = { AttendanceCheck } />
                                <Route exact path='/coinManagement' component = { CoinManagement } />
                                <Route exact path='/communityMenu' component = { CommunitySchedule } />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default CommunityMenu;