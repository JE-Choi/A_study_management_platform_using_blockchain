import React, { Component } from 'react';
import './AttendanceCheck.css';
import $ from 'jquery';
import { post } from 'axios';

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
            valid_attendance_time : 1, // 출석 체크 총 유효 시간
            userId: '', // 사용자 id
            studyId: '', // 스터디 id
            first_start_date_view: '', // 최초 출석자 날짜
            first_start_time_view: '', // 최초 출석자 시각
            is_attendance: 0 // 출석 여부
        }
      }

    componentDidMount(){
        this.make_tag();
        this.getEnterSession();
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
        let s_minute = stDate.getMinutes() + Number(this.state.valid_attendance_time);
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

                // 텍스트 - 출석 미완료
                // this.isAttendStatus(0);
                // 출석 미완료
                $('#completion').text('출석 미완료'); 
            } else{
                RemainDate = RemainDate - 1000; // 남은시간 - 1초
            }
        }
    }

    // 출석 시간 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();

        // 출석 유효시간 측정 타이머 
        this.setAttendance(); 
        // 타이머 작동하면 시간 선택 불가
        $('#valid_attendance_time').attr("disabled","disabled");
        // 타이머 작동하면 버튼 선택 불가 
        $('#btn_attendance_check').attr("disabled","disabled");

        // 최초 출석자인지 확인
        this.isFirstAttend().then((res)=>{
            let numOfAttendance = res.data.length;
            
            // 최초 출석자인 경우
            if(numOfAttendance === 0){
                this.isAttendStatus(1).then((res)=>{
                    console.log(res);
                });
            } 

            // 아직 출석하지 않은 스터디 원인 경우
            else{
                let startDate = res.data[0].attendance_start_date; // 시작 날짜
                let startTime = res.data[0].attendance_start_time; // 시작 시간
                let startMoment = new Date(startDate+' '+startTime).getTime();
                            
                // console.log(res);
                var hours = 9 + Math.floor((startMoment % (1000 * 60 * 60 * 24)) / (1000*60*60));

                if(hours > 24){
                    hours = hours - 24;
                }

                var miniutes = Number(res.data[0].valid_time) + Math.floor((startMoment % (1000 * 60 * 60)) / (1000*60));
                if(miniutes > 60){
                    hours = hours + 1;
                    miniutes = miniutes - 60;
                }
                
                // var seconds = Math.floor((startMoment % (1000 * 60)) / 1000);
                var seconds = 59;

                let valid_add_time = new Date(startDate+' '+hours+':'+ miniutes+':'+seconds);
                let my_attentdance_dateTime = new Date();

                // console.log(valid_add_time);

                // 최초 출석자가 아닌 사람이 출석 유효시간보다 늦은 경우
                if( my_attentdance_dateTime > valid_add_time){

                    alert('출석 불가');
                } 
                // 제 시간에 출석한 경우
                else{
                    alert('출석 완료');
                    // 유효 시간 내에 출석을 완료한 경우
                    let start_date = new Date(startDate+' '+startTime);
                    let s_year = String(start_date.getFullYear());
                    let s_month = String(start_date.getMonth()+1);
                    let s_date = String(start_date.getDate());

                    let s_hour = String(start_date.getHours());
                    let s_minute = String(start_date.getMinutes());
                    let s_second = String(start_date.getSeconds());

                    let start_date_view = s_year+'-'+s_month+'-'+s_date;
                    let start_time_view = s_hour+':'+s_minute+':'+s_second;

                    this.setState ({
                        first_start_date_view: start_date_view, // 최초 출석자 날짜
                        first_start_time_view: start_time_view // 최초 출석자 시각
                    });
                   
                    // 출석 완료
                    this.isAttendStatus(1);
                    // 출석 완료
                    $('#completion').text('출석 완료');                   
                }
            }
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 최초 출석자인지 확인
    isFirstAttend = async () => {
        const url = '/api/community/isFirstAttend';
        
        let start_date = new Date();
        let s_year = String(start_date.getFullYear());
        let s_month = String(start_date.getMonth()+1);
        let s_date = String(start_date.getDate());
        let start_date_view = s_year+'-'+s_month+'-'+s_date;

        console.log(this.state.studyId+'/'+start_date_view);

        return post(url, {
            study_id: this.state.studyId,
            attendance_start_date: start_date_view
        });
    }

    // 출석, 미출석 상태에 따른 DB 삽입
    isAttendStatus = async(is_attendance) => {
        const url = '/api/community/isAttendStatus';

        let start_date = new Date();
        let s_year = String(start_date.getFullYear());
        let s_month = String(start_date.getMonth()+1);
        let s_date = String(start_date.getDate());

        let s_hour = String(start_date.getHours());
        let s_minute = String(start_date.getMinutes());
        let s_second = String(start_date.getSeconds());

        let start_date_view = s_year+'-'+s_month+'-'+s_date;
        let start_time_view = s_hour+':'+s_minute+':'+s_second;

        return post(url, {
            study_id: this.state.studyId,
            user_id: this.state.userId,
            attendance_start_date: start_date_view,
            attendance_start_time: start_time_view,
            is_attendance: is_attendance,
            valid_attendance_time: this.state.valid_attendance_time
        });       
    }  

    // 사용자 ID, 들어온 스터디 번호 불러오기
    getEnterSession = async () => {
        if (typeof(Storage) !== "undefined") {
            await this.setState({userId : sessionStorage.getItem("loginInfo")});
            await this.setState({studyId : sessionStorage.getItem("enterStudyid")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
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
                        <div className="btn btn-danger" id="completion">출석 미완료</div>
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