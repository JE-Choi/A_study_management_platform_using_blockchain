import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

class CommunityMenu extends Component {
    componentDidMount(){
        this.setEnterStudyidSession();
    }

    // Studyitem session 저장
    setEnterStudyidSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.callStudyItem().then((res)=>{
                console.log({'studyitem':res});
                sessionStorage.setItem("enterStudyid", this.props.id);
                sessionStorage.setItem("enterStudyitem", JSON.stringify(res)); // 객체를 session에 저장하기 위함.
            });
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    callStudyItem = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.id);
        const body = await response.json();
        return body;
    }

    setReloads = () => {
        setTimeout(function() { 
          window.location.reload();
        }, 100);
    }

    onClickSchedule = () => {
        window.location.replace('/community/'+sessionStorage.getItem("enterStudyid")+'/communitySchedule');
    }
    
    render() {
        return (
            <Router>
                <div className="communityMenu_out_div_web">
                    <div className="main_communityMenu">
                        <div style={{marginTop: 10}} className = "communityMenu_container">
                            <nav className="communityMenuBar_wrapper">
                                <ul className="communityMenuBar_nav">
                                    <li>
                                        <Link to={'/community/'+this.props.id+'/joinMembers'} 
                                            onClick={this.setReloads} 
                                            className="community_nav_link">
                                                스터디 멤버
                                        </Link>
                                    </li>
                                    <li>
                                        <span className="community_nav_link" 
                                            onClick={this.onClickSchedule}>
                                                Schedule
                                        </span>
                                    </li>
                                    <li>
                                        <Link to={'/community/'+this.props.id+'/attendanceCheck'} 
                                            onClick={this.setReloads} 
                                            className="community_nav_link">
                                                출석
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={'/community/'+this.props.id+'/aboutQuiz'} 
                                            onClick={this.setReloads} 
                                            className="community_nav_link">
                                                퀴즈
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={'/community/'+this.props.id+'/coinManagement'} 
                                            onClick={this.setReloads} 
                                            className="community_nav_link">
                                                계좌 이용 내역
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default CommunityMenu;