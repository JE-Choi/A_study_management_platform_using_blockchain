import React, { Component } from 'react';
import './AboutCommunity.css';
import $ from 'jquery';
import { post } from 'axios';
import alert from '../utils/Alert';
import ProgressBar from '../utils/ProgressBar/ProgressBar';
import InitContract from './BlockChain/InitContract';
import NotAttendHandler from './AttendanceCheck/NotAttendHandler';
import SendTardinessTransfer from './AttendanceCheck/SendTardinessTransfer';
import ProgressBarBackGround from '../utils/ProgressBar/ProgressBarBackGround';

class AttendanceCheck extends Component {
    render() {
        return (
            <div className="main">
                <div className="content">
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
            is_attendance: 0, // 출석 여부
            is_first_attend: 0, // 당일 최초 출석 여부
            edDate: null, // 출석 시작 시간 + 유효 시간까지 더한 마지노선 시간   
            is_end: 0,
            studyEnd:0,
            attendance_num_auth: 0, // 생성된 난수
            attendance_num_input: '', // 출석 인증 입력한 숫자
            attendance_check_state: '출석 시작', // 현재 출석 상태
            use_coin_value: 0, // 미결 1회당 차감되는 값
            // 블록체인
            web3: null
        }
    }

    // 접속한 스터디가 종료된 스터디인지 확인
    callStudyIsEnd = async () => {
        const url = '/api/community/isEnd';

        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid")
        });
    }

    componentDidMount = async () => {
        $('.progress_layer').hide();
        this.callStudyIsEnd().then((res)=>{
            // if(res.data.length!== 0){
                // 스터디 종료 여부 (1: end, 0:not end)
                let is_end = res.data[0].is_end; 
                let studyEnd = sessionStorage.getItem("studyEnd");
                this.setState({
                    studyEnd: studyEnd
                });
                console.log('is_end: ', studyEnd);

                if(is_end === 0){
                    InitContract.init().then(()=>{
                        this.setState({web3: InitContract.web3});
                        // 출석 시작 전에는 출석 인증 번호 숨기기
                        $('.attendance_auth_label').hide();
                        $('#attendance_auth_text').hide();
                        $('#btn_attendance_end').hide(); 

                        var studyItemObj = JSON.parse(sessionStorage.getItem("enterStudyitem"));
                        
                        let study_join_coin = studyItemObj[0].study_coin;
                        let study_join_cnt = studyItemObj[0].study_cnt;
                        console.log(study_join_cnt);
                        if(study_join_cnt === 0){
                            alert("오류: 스터디 횟수가 2이상은 스터디 생성해서 실험.");
                        } else {
                            // 출석체크에서 사용가능한 최대 ether 값
                            // 숫자는 substr이 안됨.
                            let use_coin_max = Number(String(study_join_coin * 0.6).substr(0,6));
                            // 출석체크 1회에서 차감될 ether 값
                            let use_coin_value = Number(String(use_coin_max / study_join_cnt).substr(0,6));
                            this.setState({
                                use_coin_value:use_coin_value
                            });
                            console.log(use_coin_max, use_coin_value);
                        }

                        // 출석체크 정책 유의사항 modal
                        alert.confirm('','미출석자는 출석한 스터디원들에게 자동으로 Ether를 지불합니다.');
                        this.make_tag();
                        // 사용자 ID, 들어온 스터디 번호 불러오기
                        this.getSession().then(()=>{
        
                            // 출석 화면에 진입한 오늘 시간
                            let today_date = new Date();
                            let today_year_str = String(today_date.getFullYear());
                            let today_month_str = String(today_date.getMonth()+1);
                            let today_day_str = String(today_date.getDate());
        
                            let today_date_view = today_year_str+'-'+today_month_str+'-'+today_day_str;

                            // 최초 출석인지 확인
                            this.isFirstAttend(today_date_view).then((res)=>{
                                let today_attendance = res.data.length;

                                this.isFirstAttendee(today_date_view).then((result)=>{
                                    // 당일 최초 출석자인 경우
                                    if(result.data.length === 1) {
                                        this.setState({
                                            is_first_attend: 1 // 당일 최초 출석 여부
                                        }); 
                                    }
                                })

                                // 스터디가 출석체크를 진행 중인 경우
                                if(today_attendance !== 0){
                                    let first_attend_date = res.data[0].attendance_start_date;
                                    let first_attend_time = res.data[0].attendance_start_time;
                                    let first_attend_valid_time = res.data[0].valid_time;
                                    
                                    console.log(first_attend_date,first_attend_time);
        
                                    let first_attend_dateTime = new Date(first_attend_date+' '+first_attend_time).getTime();
                                                
                                    var hours = 9 + Math.floor((first_attend_dateTime % (1000 * 60 * 60 * 24)) / (1000*60*60));
        
                                    if(hours > 24){
                                        hours = hours - 24;
                                    } else if (hours === 24){
                                        hours = 0;
                                    }

                                    var miniutes,seconds;
                                    if(Number(first_attend_valid_time) <= 10){
                                        miniutes = Number(first_attend_valid_time) + Math.floor((first_attend_dateTime % (1000 * 60 * 60)) / (1000*60));
                                        if(miniutes >= 60){ 
                                            hours = hours + 1;
                                            miniutes = miniutes - 60;
                                        }
                                        seconds = Math.floor((first_attend_dateTime % (1000 * 60)) / 1000);
                                    } else {
                                        miniutes = Math.floor((first_attend_dateTime % (1000 * 60 * 60)) / (1000*60));
                                        seconds = Number(first_attend_valid_time) + Math.floor((first_attend_dateTime % (1000 * 60)) / 1000);
                                        if(seconds >= 60){ 
                                            miniutes = miniutes + 1;
                                            seconds = seconds - 60;
                                        }
                                    }
                                    
        
                                    console.log(first_attend_date+' '+hours+':'+ miniutes+':'+seconds);
                                    let valid_add_time = new Date(first_attend_date+' '+hours+':'+ miniutes+':'+seconds);
                                    
                                    this.setState ({
                                        edDate: valid_add_time, // 타이머 종료 시간을 출석 시간 마지노선 시간으로 설정
                                        attendance_num_auth: res.data[0].random_num_auth // 출석 체크 인증을 위한 난수 설정
                                    });
                                    
                                    // 최초 출석자 아니면 시간 선택 불가
                                    this.setState({valid_attendance_time:first_attend_valid_time});
                                    $('#valid_attendance_time').val(first_attend_valid_time); 
                                    $('#valid_attendance_time').attr("disabled","disabled"); 
                                    
                                    // 출석 유효시간 측정 타이머
                                    this.setAttendance(this.state.studyId, this.state.userId, this.state.use_coin_value);    
                                }
                            });
                        });
                    });
                    }
        });
    }

    // 스터디에 가입한 현재 사람 정보 얻어오는 부분
    callCurrentPeopleInfo = async () => {
        const url = '/api/community/isNotAttend';
        var enter_date =  new Date();
        let s_year = enter_date.getFullYear();
        let s_month = enter_date.getMonth()+1;
        let s_date = enter_date.getDate();
        
        let attendance_start_date = s_year + '-'+s_month+ '-'+s_date;
        return post(url,  {
            study_id: this.state.studyId,
            attendance_start_date: attendance_start_date
        });
    }

    // 사용자 이름 session 불러오기
    getUserNameSession = async () =>{
        if (typeof(Storage) !== "undefined") {
            await this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
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

    // 출석 유효시간 측정 타이머
    setAttendance(_studyId, _userId, _use_coin_value) {
        function attendanceTransactionConfirm() {
            alert.confirm('출석 거래 완료','[계좌 이용 내역] 화면에서 확인할 수 있습니다.');
        }

        // 자신의 출석 여부에 따라 달라지는 버튼 색
        async function isAttendanceRateBtn(_studyId, _userId){
            const url = '/api/community/isAttendanceRateBtn';
            
            let start_date = new Date();
            let s_year = String(start_date.getFullYear());
            let s_month = String(start_date.getMonth()+1);
            let s_date = String(start_date.getDate());

            let start_date_view = s_year+'-'+s_month+'-'+s_date;

            return post(url, {
                study_id: _studyId,
                user_id: _userId,
                attendance_start_date: start_date_view
                }); 
        }
         
        // 최초 출석인지 확인
        async function isFirstAttend(attendance_date){
            const url = '/api/community/isFirstAttend';
            
            return post(url, {
                study_id: _studyId,
                attendance_start_date: attendance_date
            });
        }

        $(document).ready(function() {
            tid = setInterval(function(){
                msg_time(_studyId);
            }, 1000); // 타이머 1초 간격으로 수행
        });

        var tid = 0;
        var stDate =  new Date();
        let e_year = stDate.getFullYear();
        let e_month = stDate.getMonth()+1;
        let e_date = stDate.getDate();
        let e_hour = stDate.getHours();
        let e_minute;
        let e_second;
        if(Number(this.state.valid_attendance_time) <= 10){
            e_minute = stDate.getMinutes() + Number(this.state.valid_attendance_time);
            e_second = stDate.getSeconds();
            if(e_minute >= 60){ 
                e_hour = e_hour + 1;
                e_minute = e_minute - 60;
            }
        } else {
            e_minute = stDate.getMinutes();
            e_second = stDate.getSeconds() + Number(this.state.valid_attendance_time);
            if(e_second >= 60){ 
                e_minute = e_minute + 1;
                e_second = e_second - 60;
            }
        }
        

        var edDate = 0;
        
        // 출석체크 진행 중인 경우
        if (this.state.edDate !== null) { 
            edDate = this.state.edDate.getTime();

            this.setState({
                attendance_check_state: '출석 중'
            }); 

            isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                // 출석 결과가 DB에 삽입이 잘 된 경우
                if(res.data.length !== 0){
                    // 유효시간 끝나면 출석종료와 출석 완료 버튼 색 적용
                    if(res.data[0].is_attendance === 1){
                        $('#completion').text('결과 : 출석 완료'); 
                        this.setState({
                            attendance_check_state: '출석 중'
                        });
                        $('#btn_attendance_check').attr("disabled","disabled");
                        $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
                    }
                }    
            });
        } 
        // 출석체크가 진행중이지 않은 경우
        else{
            this.setState({
                attendance_check_state: '출석 중'
            });
            $('#completion').text('결과 : 출석 완료'); 
            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
            
            edDate = new Date(e_year+'-'+e_month+'-'+e_date+' '+e_hour+':'+e_minute+':'+e_second).getTime(); // 종료시간
        }    

        stDate = stDate.getTime(); // 시작시간
       
        var RemainDate = edDate - stDate; // 잔여시간
        console.log(e_year+'-'+e_month+'-'+e_date+' '+e_hour+':'+e_minute+':'+e_second);
        console.log({'edDate':edDate, 'stDate':stDate, 'RemainDate':RemainDate});
        // 시간 감소시켜 화면에 출력하는 메소드
        function msg_time(_studyId){
            var miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000*60));
            var seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);
        
            var m = miniutes + "분  " + seconds + "초"; // 남은 시간 text형태로 변경

            $('#timer').text(m);

            // 출석 인증 번호 입력창 나타내기
            $('.attendance_auth_label').show();
            $('#attendance_auth_text').show();

            if (RemainDate < 1000) {
                clearInterval(tid);   // 타이머 해제 
                // 출석 시작 전에는 출석 인증 번호 숨기기
                $('.attendance_auth_label').hide();
                $('#attendance_auth_text').hide();

                let check_date = new Date();
                let c_year = String(check_date.getFullYear());
                let c_month = String(check_date.getMonth()+1);
                let c_date = String(check_date.getDate());

                let c_hour = String(check_date.getHours());
                let c_minute = String(check_date.getMinutes());
                let c_second = String(check_date.getSeconds());

                let attendance_date = c_year+'-'+c_month+'-'+c_date;
                let attendance_view = c_hour+':'+c_minute+':'+c_second;
                
                // 조건 거래 검증
                // 당일 거래 존재 확인
                SendTardinessTransfer.statusOfTardinessTransaction(_studyId, attendance_date).then((res)=>{
                    if(res.data.length === 0){
                        // 최초 출석자있는 경우에만 처리 진행
                        isFirstAttend(attendance_date).then((res)=>{
                            let num_of_attendance = res.data.length;
                            console.log('num_of_attendance: ', num_of_attendance);
                            // 최초 출석자있는 경우
                            if(num_of_attendance !== 0){ 
                                // 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자
                                SendTardinessTransfer.attendance_trading_authority(_studyId, attendance_date).then((is_first_res)=>{
                                    if(is_first_res.data.length === 1){
                                        $('.progress_layer').show();
                                        // 최초 출석자가 지정한 유효시간 가져옴.
                                        let valid_attendance_time = res.data[0].valid_time;
                                            $('.sub_msg2').text('조금만 기다려 주세요...10%');
                                            // 미 출석자 DB 처리
                                            NotAttendHandler.run(_studyId, attendance_date, attendance_view, valid_attendance_time).then((is_end)=>{
                                                if(is_end === true){
                                                    $('.sub_msg2').text('조금만 기다려 주세요...60%');
                                                    SendTardinessTransfer.run(_studyId, attendance_date, _use_coin_value).then((is_end)=>{
                                                        if(is_end === true){
                                                            $('.sub_msg2').text('조금만 기다려 주세요...90%');
                                                            console.log('모든 거래 완료');
                                                            $('.progress_layer').hide();
                                                            attendanceTransactionConfirm();
                                                    }
                                                });
                                            } else{
                                                $('.progress_layer').hide();
                                                SendTardinessTransfer.inert_status_of_tardiness(_studyId, attendance_date, true);
                                                alert.confirm('','전원 출석했습니다.');
                                            }
                                        });
                                    }
                                });
                            } 
                        });
                    }
                });
                
                $('#btn_attendance_check').hide(); 
                $('#btn_attendance_end').show(); 
            
                var minsecond = "00분 00초"; // 남은 시간 text형태로 변경
                $('#timer').text(minsecond);
                
                // 타이머 작동하면 시간 선택 불가
                $('#valid_attendance_time').attr("disabled","disabled");    
                // 타이머 작동하면 버튼 선택 불가 
                $('#btn_attendance_check').attr("disabled","disabled");

                // 자신의 출석 여부에 따라 달라지는 버튼 색
                isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                    // 출석 결과가 DB에 삽입이 잘 된 경우
                    if(res.data.length !== 0){
                        // 유효시간 끝나면 출석종료와 출석 완료 버튼 색 적용
                        if(res.data[0].is_attendance === 1){
                            $('#completion').text('결과 : 출석 완료'); 
                            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
                        }
                        // 유효시간 지났는데도 출석체크가 안된 경우 
                        else {
                            $('#completion').text('결과 : 출석 미완료'); 
                            $('#completion').attr('style',  'background-color:rgb(255, 80, 80) !important; border-color:rgb(255, 80, 80) !important;');
                        }
                    }
                    // 출석 결과가 DB에 삽입이 잘 안 된 경우 
                    else{
                        $('#completion').text('결과 : 출석 미완료');  
                        $('#completion').attr('style',  'background-color:rgb(255, 80, 80) !important; border-color:rgb(255, 80, 80) !important;');
                    }
                });
            } else{
                RemainDate = RemainDate - 1000; // 남은시간 - 1초
            }
        }
    }

    // "출석 시작" 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();
       
        // 타이머 작동하면 시간 선택 불가
        $('#valid_attendance_time').attr("disabled","disabled"); 
        this.setState({
            attendance_check_state: '출석 중'
        });

        let start_date = new Date();
        let s_year = String(start_date.getFullYear());
        let s_month = String(start_date.getMonth()+1);
        let s_date = String(start_date.getDate());
        let start_date_view = s_year+'-'+s_month+'-'+s_date;

        // 최초 출석인지 확인
        this.isFirstAttend(start_date_view).then((res)=>{
            let num_of_attendance = res.data.length;

            // 최초 출석자인 경우
            if(num_of_attendance === 0){
                // 출석 인증 번호 입력창 나타내기
                $('.attendance_auth_label').show();
                $('#attendance_auth_text').show();
                
                // 출석 체크 인증을 위한 난수 발생
                this.generateRandomNum(1, 1000000, 1);

                $('#completion').text('결과 : 출석 완료'); 
                $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
                // 타이머 작동하면 버튼 선택 불가 
                $('#btn_attendance_check').attr("disabled","disabled");

                this.isAttendStatus(1, true).then((res)=>{
                    // 당일 최초 출석 여부를 1로 설정
                    this.setState({
                        is_first_attend : 1
                    });
                    // 출석 유효시간 측정 타이머 
                    this.setAttendance(this.state.studyId, this.state.userId, this.state.use_coin_value);
                });
            }
            // 아직 출석하지 않은 스터디 원인 경우
            else{
                
                let startDate = res.data[0].attendance_start_date; // 시작 날짜
                let startTime = res.data[0].attendance_start_time; // 시작 시간
                let startMoment = new Date(startDate+' '+startTime).getTime();
                            
                var hours = 9 + Math.floor((startMoment % (1000 * 60 * 60 * 24)) / (1000*60*60));

                if(hours > 24){
                    hours = hours - 24;
                } else if(hours === 24){
                    hours = 0;
                }

                var miniutes = Number(res.data[0].valid_time) + Math.floor((startMoment % (1000 * 60 * 60)) / (1000*60));
                if(miniutes > 60){
                    hours = hours + 1;
                    miniutes = miniutes - 60;
                }
                
                var seconds = Math.floor((startMoment % (1000 * 60)) / 1000);

                let valid_add_time = new Date(startDate+' '+hours+':'+ miniutes+':'+seconds);
                let my_attentdance_dateTime = new Date();

                // 유효 시간 내에 출석을 완료한 경우
                if( my_attentdance_dateTime <= valid_add_time){
                    this.setState ({
                        first_start_date_view: res.data[0].attendance_start_date, // 최초 출석자 날짜
                        first_start_time_view: res.data[0].attendance_start_time, // 최초 출석자 시각
                        valid_attendance_time: res.data[0].valid_time
                    });

                    // 출석 인증 번호 확인
                    this.getAuthNumber().then((res)=>{
                        let random_num_auth = res.data[0].random_num_auth;

                        // 출석자가 출석 인증 번호를 올바르게 입력한 경우
                        if(random_num_auth === Number(this.state.attendance_num_input)) {
                            this.setState({
                                attendance_check_state: '출석 중'
                            });

                            $('#completion').text('결과 : 출석 완료'); 
                            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');
                            // 타이머 작동하면 버튼 선택 불가 
                            $('#btn_attendance_check').attr("disabled","disabled");
                            
                            // 출석 완료
                            this.isAttendStatus(1, false);       
                        }
                        // 출석자가 출석 인증 번호를 올바르게 입력하지 못한 경우
                        else{
                            this.setState({
                                attendance_check_state: '출석 중'
                            });
                            this.setState({
                                attendance_num_input:''
                            });

                            // 인증번호 다르게 입력했을 때 modal
                            alert.confirm('','인증 번호를 다시 입력해주세요.');
                        }
                    });
                }
            }
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 오늘 최초 출석인지 확인
    isFirstAttend = async (_start_date_view) => {
        const url = '/api/community/isFirstAttend';
        
        return post(url, {
            study_id: this.state.studyId,
            attendance_start_date: _start_date_view
        });
    }   

    // 최초 출석자에 따라 출석 취소 버튼 활성화하기 위한 자신이 최초 출석자인지 확인
    isFirstAttendee = async(_start_date_view) => {
        const url = '/api/community/isFirstAttendee';
        
        return post(url, {
            study_id: this.state.studyId,
            person_id : this.state.userId,
            attendance_start_date: _start_date_view
        });
    }

    // 출석, 미출석 상태에 따른 DB 삽입
    isAttendStatus = async(is_attendance, is_first) => {
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

        console.log(this.state.studyId, this.state.userId, start_date_view, start_time_view, is_attendance, this.state.valid_attendance_time, is_first, this.state.attendance_num_auth);
        return post(url, {
            study_id: this.state.studyId,
            user_id: this.state.userId,
            attendance_start_date: start_date_view,
            attendance_start_time: start_time_view,
            is_attendance: is_attendance,
            valid_attendance_time: this.state.valid_attendance_time,
            is_first : is_first,
            attendance_num_auth: this.state.attendance_num_auth
        });       
    }  

    // 출석 체크 인증을 위한 난수 발생
    generateRandomNum = (min, max, number) => {
        // 1 ~ 1000000까지의 중복 없는 난수 발생
        let randList = [];

        for (let i = min; i <= max; i++) {
            randList.push(i);
        }
        for (let i = 0; i < number; i++) {
            this.getRand(randList);
        }
    }

    // 출석 체크 인증을 위한 난수 발생 관련
    getRand(randList) {
        let randIndex = Math.floor(Math.random() * randList.length);
        let attendance_num_auth = randList[randIndex];
        randList.splice(randIndex, 1); // 배열 randList에서 하나 삭제

        this.setState({
            attendance_num_auth: attendance_num_auth
        });
    }

    // 출석 인증 번호 확인
    getAuthNumber = async() => {
        const url = '/api/community/getAuthNumber';

        let today_date = new Date();
        let s_year = String(today_date.getFullYear());
        let s_month = String(today_date.getMonth()+1);
        let s_date = String(today_date.getDate());

        let today_date_view = s_year+'-'+s_month+'-'+s_date;

        return post(url, {
            study_id: this.state.studyId,
            attendance_start_date: today_date_view
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

    getSession= async () => {
        this.getUserNameSession();
        this.getEnterSession();
    }

    make_tag = () =>{
        $("#valid_attendance_time").append('<option>'+20+'</option>');
        $("#valid_attendance_time").append('<option>'+30+'</option>');
        for(let i = 1; i < 11; i++){
            let text = '<option>'+i+'</option> 분';
            $("#valid_attendance_time").append(text);
        }
    }
    
    render() {
        return(
            <div className="div_attendance_check">
                {/* 스터디 종료 조건에 부합하지 않는 스터디인가? */}
                {Number(this.state.studyEnd) === 0?
                    <div>
                        {InitContract.web3 ? 
                        <div>
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
                                        {Number(this.state.valid_attendance_time) > 10 ? <span>초</span>:<span>분</span>}
                                    </div>
                                    <div>
                                        <input type="submit" value={this.state.attendance_check_state} className="btn btn-outline-primary" id="btn_attendance_check" />
                                        <input type="button" className="btn btn-outline-primary" id="btn_attendance_end" value="출석 종료" disabled/>
                                    </div>
                                </form> 
                                <div className="attend_status">
                                    <div className="btn btn-info" id="completion">결과 : 출석 미완료</div>
                                </div>

                                <div className="random_number_out_div">
                                    {this.state.is_first_attend === 1?
                                        <div className="random_number_desc">
                                            <div>"출석 시작" 버튼을 누르면 난수가 발생됩니다.</div>
                                            <div>
                                                현재 출석한 다른 스터디 원에게 <br className="random_desc_br" />
                                                아래의 난수를 알려주면 출석이 진행됩니다.
                                            </div>
                                            <div className="random_number_in_div">
                                                <span className="attendance_auth_label">출석 인증 번호 : </span>
                                                <input type="text" className="form-control" 
                                                    id="attendance_auth_text" placeholder="출석 인증 번호"
                                                    value={this.state.attendance_num_auth} disabled/>
                                            </div>
                                        </div>
                                        :
                                        <div className="random_number_desc">
                                            <div>최초 출석자가 알려준 난수를 입력한 후, </div>
                                            <div>"출석 중" 버튼을 누르면 출석이 인정됩니다.</div>
                                            <div className="random_number_in_div">
                                                <span className="attendance_auth_label">출석 인증 번호 : </span>
                                                <input type="number" className="form-control" 
                                                    id="attendance_auth_text" name='attendance_num_input' value={this.state.attendance_num_input}
                                                    onChange={this.handleValueChange}/>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>    
                        </div>
                    </div>
                       : <ProgressBar message ='로딩중'/>}
                    </div>
                   :
                    <div>
                        <div className="attendance_header">출석 현황</div>
                        <div className="attendance_content_end">
                            스터디가 종료되어 
                            <br/>
                            더 이상 출석체크가 불가능합니다. 
                            <br/><br/>
                            그동안 고생 많으셨습니다.
                        </div>
                    </div>
                }  
                 <ProgressBarBackGround 
                    message = "출석 거래 진행하는 중..." 
                    sub_msg1="잠시만 기다려 주세요."/>
            </div>
        );
    }
}

export default AttendanceCheck;