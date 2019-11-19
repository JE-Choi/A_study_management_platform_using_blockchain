import React, { Component } from 'react';
import { BrowserRouter as  Switch, Route } from 'react-router-dom';
import AboutMembers from '../AboutMembers';
import CommunitySchedule from '../Schedule/CommunitySchedule';
import AttendanceCheck from '../AttendanceCheck';
import AboutQuiz from '../AboutQuiz';
import CoinManagement from '../CoinManagement';

class CommunityContents extends Component {
    render() {
        return (
            <React.Fragment>
                <div className="clear"></div>
                <div className = "communityMenu_container">
                    <div className = "communityMenuBar_switch">
                        <Switch>
                            <Route exact path='/community/:id/joinMembers' component = { AboutMembers } />
                            <Route exact path='/community/:id/communitySchedule' component = { CommunitySchedule } />
                            <Route exact path='/community/:id/communitySchedule/:submenu' component = { CommunitySchedule } />
                            <Route exact path='/community/:id/attendanceCheck' component = { AttendanceCheck } />
                            <Route exact path='/community/:id/aboutQuiz' component = { AboutQuiz } />
                            <Route exact path='/community/:id/aboutQuiz/:submenu' component = { AboutQuiz } />
                            <Route exact path='/community/:id/coinManagement' component = { CoinManagement } />
                            <Route exact path='/community/:id' component = { CommunitySchedule } />
                        </Switch>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default CommunityContents;