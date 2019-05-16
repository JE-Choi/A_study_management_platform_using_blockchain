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

    constructor(props) {
        super(props);
        this.state = {
            // 출석 체크 총 유효 시간
            valid_attendance_time : 1 
        }
      }

    componentDidMount(){
        this.make_tag();
    }

    // 출석 유효시간 측정 타이머
    setAttendance() {
        $(document).ready(function() {
            tid = setInterval(function(){
                msg_time();
            }, 1000); // 타이머 1초 간격으로 수행
        });

        var tid = 0;
        
        var stDate =  new Date();
        let s_year = stDate.getFullYear();
        let s_month = stDate.getMonth()+1;
        let s_date = stDate.getDate();
        let s_hour = stDate.getHours();
        let s_minute = stDate.getMinutes()+Number(this.state.valid_attendance_time);
        let s_second = stDate.getSeconds();
        var edDate =  new Date(s_year+'-'+s_month+'-'+s_date+' '+s_hour+':'+s_minute+':'+s_second).getTime(); // 종료시간
        stDate = stDate.getTime(); // 시작시간
        
        var RemainDate = edDate - stDate; // 잔여시간
        
         
        function msg_time() {
            //var hours = Math.floor((RemainDate % (1000 * 60 * 60 * 24)) / (1000*60*60));
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

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.setAttendance(); // 출석 유효시간 측정 타이머 
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    make_tag = () =>{
        for(let i = 1; i < 11; i++){
            $("#valid_attendance_time").append('<option>'+i+'</option>' + '분');
        }
    }

    render() {
        return(
            <div className="div_attendance_check">
                <div className="attendance_header">출석 현황</div>
                <div className="attendance_content">
                    <div>
                        <span className="attendance_effective_time">출석 유효 시간 :</span>
                        <span className="attendance_effective_time" id="timer">00분 00초</span>
                        <br /> 
                    </div>   
                    <div className="attendance_status_control">
                        <form onSubmit={this.handleFormSubmit}>
                            <div className="attendance_form_group">
                                <select className="form-control" id="valid_attendance_time" name='valid_attendance_time' value={this.state.valid_attendance_time} onChange={this.handleValueChange}>
                                </select>
                                <span>분</span>
                            </div>
                            <div>
                                <input type="submit" value="출석 시작" className="btn btn-danger" id="btn_attendance_check"  />
                            </div>
                        </form> 
                        <div className="btn btn-danger" id="completion">출석 완료</div>
                    </div>    
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