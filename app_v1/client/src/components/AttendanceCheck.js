import React, { Component } from 'react';
import './AttendanceCheck.css';

class AttendanceCheck extends Component {
    render() {
        return (
            <div className="main_attendance">
                <div className="content_attendance">
                    <Attendance />
                </div>
            </div>
        )
    }
}

class Attendance extends Component{
    render(){
        return(
            <div className="div_attendance_check">
                <div className="attendance_header">출석 현황</div>
                <div className="attendance_content">
                    <span className="attendance_effective_time">출석 유효 시간 </span>
                    <span className="attendance_effective_time"> 09 : 58 </span>
                    <br />
                    <div>
                        <input type="button" value="출석 시작" className="btn btn-danger" id="btn_attendance_check"/>
                    </div>
                    <div className="btn btn-danger" id="completion">출석 완료</div>    
                </div>
                <div className="attendance_status">
                    <span className="info_attendance_check"> 3번 </span>
                    <span className="info_attendance_check"> Study 중 </span>
                    <span className="info_attendance_check"> 3번 </span>
                    <span className="info_attendance_check">출석</span>
                </div>
            </div>
        );
    }
}

export default AttendanceCheck;