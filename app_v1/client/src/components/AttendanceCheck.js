import React, { Component } from 'react';
import './AttendanceCheck.css';
import $ from 'jquery';

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

class Attendance extends Component {

    componentDidMount(){
        this.setAttendance();
    }

    // 출석 유효시간 측정 타이머
    setAttendance() {
        $(document).ready(function() {
            tid = setInterval(function(){
                msg_time();
            }, 1000); // 타이머 1초간격으로 수행
        });

        var tid = 0;
        var stDate = new Date().getTime();
        var edDate = new Date('2019-05-06 21:50:00').getTime(); // 종료날짜
        var RemainDate = edDate - stDate;
         
        function msg_time() {
            var hours = Math.floor((RemainDate % (1000 * 60 * 60 * 24)) / (1000*60*60));
            var miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000*60));
            var seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);
        
            var m = miniutes + "분  " + seconds + "초"; // 남은 시간 text형태로 변경
            
            $('#timer').text(m);
            
            if (RemainDate < 1000) {
                clearInterval(tid);   // 타이머 해제
            } else{
                RemainDate = RemainDate - 1000; // 남은시간 - 1초
            }
        }
    }

    render() {
        return(
            <div className="div_attendance_check">
                <div className="attendance_header">출석 현황</div>
                <div className="attendance_content">
                    <span className="attendance_effective_time">출석 유효 시간 :</span>
                    <span className="attendance_effective_time" id="timer"></span>
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