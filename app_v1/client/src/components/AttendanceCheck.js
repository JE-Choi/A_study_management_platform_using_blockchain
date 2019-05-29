import React, { Component } from 'react';
import './AboutCommunity.css';
import $ from 'jquery';
import { post } from 'axios';
// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

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
            edDate: null, // 출석 시작 시간 + 유효 시간까지 더한 마지노선 시간          
            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null
        }
    }

    componentWillMount = async () => {

        this.initContract();
    };

    componentDidMount= async () => {
        this.make_tag();
        this.initContract().then(()=>{
            this.getUserNameSession().then(()=>{
                this.getEnterSession().then(()=>{
                    this.getPersonInfoOfStudy(this.state.studyId,this.state.userId);

                    // 출석 시작 버튼을 누른 오늘 시간
                    let today_date = new Date();
                    let today_year_str = String(today_date.getFullYear());
                    let today_month_str = String(today_date.getMonth()+1);
                    let today_day_str = String(today_date.getDate());

                    let today_date_view = today_year_str+'-'+today_month_str+'-'+today_day_str;
                    
                    // 최초 출석자인지 확인
                    this.isFirstAttend(today_date_view).then((res)=>{
                        let today_attendance = res.data.length;
                        // 스터디가 출석체크를 진행 중인 경우
                        if(today_attendance !== 0){
                            console.log(res.data);
                            let first_attend_date = res.data[0].attendance_start_date;
                            let first_attend_time = res.data[0].attendance_start_time;
                            let first_attend_valid_time = res.data[0].valid_time;

                            console.log(first_attend_date,first_attend_time);

                            let first_attend_dateTime = new Date(first_attend_date+' '+first_attend_time).getTime();
                                        
                            var hours = 9 + Math.floor((first_attend_dateTime % (1000 * 60 * 60 * 24)) / (1000*60*60));

                            if(hours > 24){
                                hours = hours - 24;
                            }

                            var miniutes = Number(first_attend_valid_time) + Math.floor((first_attend_dateTime % (1000 * 60 * 60)) / (1000*60));
                            if(miniutes > 60){
                                hours = hours + 1;
                                miniutes = miniutes - 60;
                            }
                            var seconds = 59;

                            let valid_add_time = new Date(first_attend_date+' '+hours+':'+ miniutes+':'+seconds);
                            
                            this.setState ({
                                edDate: valid_add_time // 타이머 종료 시간을 출석 시간 마지노선 시간으로 설정
                            });
                           
                            // 최초 출석자 아니면 시간 선택 불가
                            $('#valid_attendance_time').val(first_attend_valid_time); 
                            $('#valid_attendance_time').attr("disabled","disabled");  

                            // 출석 유효시간 측정 타이머
                            this.setAttendance(this.state.studyId, this.state.userId);       
                        }
                    });
                });
            });
        });
    }

    initContract = async () => {

        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
        
            // Use web3 to get the user's accounts.
            const myAccount = await web3.eth.getAccounts();
        
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = StudyGroup.networks[networkId];
            const instance = new web3.eth.Contract(
            StudyGroup.abi,
            deployedNetwork && deployedNetwork.address
            );
        
        
            // // 확인용 로그
            // console.log(ShopContract.abi);
            // console.log(web3);
            // console.log(myAccount);
        //   Set web3, accounts, and contract to the state, and then proceed with an
        //   example of interacting with the contract's methods.
        this.setState({ web3, myAccount, studyGroupInstance: instance});
        
            
        // this.getUserNameSession().then(()=>{
        //     this.getEnterSession().then(()=>{
        //         this.callLoadAccountApi(this.state.userId,this.state.studyId).then((res)=>{
        //             let account_id = res.data[0].account_id;
        //             $('.account_number').val(myAccount[account_id]);
        //             let account = myAccount[account_id];
        //             setTimeout(function(){
        //                 web3.eth.getBalance(myAccount[account_id]).then(result=>{
        //                 let balance = web3.utils.fromWei(result, 'ether');
        //                 $('#sum_of_coin').text(balance+'코인');
        //             });
        //         }, 100);
        //         });
        //     });
        // });
        } catch (error) {
            alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    // StudyGroup.sol파일의 studyMember구조체 load
    getPersonInfoOfStudy= async (_studyId, _person_id) => {
        const { studyGroupInstance, web3} = this.state; 
        let Ascii_person_id = web3.utils.fromAscii(_person_id);
        studyGroupInstance.methods.getPersonInfoOfStudy(_studyId, Ascii_person_id).call().then(function(result) {
        var memberAddress =  result[0];
        var person_id = web3.utils.toAscii(result[1]);
        var study_id =  result[2];
        var numOfCoins =  web3.utils.fromWei(String(result[3]), 'ether');
        var person_name =  web3.utils.toAscii(result[4]);
        console.log('memberAddress: ' + memberAddress);
        console.log('person_id: ' + person_id);
        console.log('study_id: ' + study_id);
        console.log('numOfCoins: ' + numOfCoins);
        console.log('person_name: ' + person_name);
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
    setAttendance(_studyId, _userId) {
        const { studyGroupInstance, myAccount, web3} = this.state;
        $(document).ready(function() {
            tid = setInterval(function(){
                msg_time(_studyId);
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

        // 출석체크 진행 중인 경우
        if (this.state.edDate !== null) {  
            var edDate = this.state.edDate.getTime();

            $('#btn_attendance_check').val('출석 중'); 

            isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                console.log(res.data);
                
                // 출석 결과가 DB에 삽입이 잘 된 경우
                if(res.data.length !== 0){
                    // 유효시간 끝나면 출석종료와 출석 완료 버튼 색 적용
                    if(res.data[0].is_attendance === 1){
                        $('#completion').text('출석 완료'); 
                        $('#btn_attendance_check').val('출석 중'); 
                        $('#btn_attendance_check').attr("disabled","disabled");
                        $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
                    }
                }    
            });
        } 
        // 출석체크가 진행중이지 않은 경우
        else{
            $('#btn_attendance_check').val('출석 중');  
            $('#completion').text('출석 완료'); 
            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
       
            // var edDate =  new Date(s_year+'-'+s_month+'-'+s_date+' '+s_hour+':'+s_minute+':'+s_second).getTime(); // 종료시간
            var edDate =  new Date('2019-05-28 10:10:00');
        }    

        stDate = stDate.getTime(); // 시작시간
        var RemainDate = edDate - stDate; // 잔여시간

         // 지각자는 매개변수로 들어온 _account_id 에게 ether 지급.
         async function  chargeTheCoin(_coin,_account_id_sender,_account_id_receiver){
            // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
            studyGroupInstance.methods.chargeTheCoin(myAccount[25]).send(
            {
                from: myAccount[2], 
                value: web3.utils.toWei("0.01", 'ether'),
                // gasLimit 오류 안나서 일단은 gas:0 으로 했지만 오류 나면 3000000로 바꾸기
                gas: 0 
            }
            );
            setTimeout(function(){
                web3.eth.getBalance(myAccount[25]).then(result=>{
                    console.log('이체 후 잔액은: ' + web3.utils.fromWei(result, 'ether'));
                });
            }, 1000);
        }

        // 스마트 계약 지각 거래발생
        async function setTardinessTransfer (_senderPerson_id, _receiverPerson_id, _date,_studyId,_coin){
            // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
            let date = web3.utils.fromAscii(_date);
            let senderPerson_id = web3.utils.fromAscii(_senderPerson_id);
            let receiverPerson_id = web3.utils.fromAscii(_receiverPerson_id);
            // sender가 receiver에세 n코인 만큼 _date일시에 보냈다는 거래 내역을 저장하는 부분
            studyGroupInstance.methods.setTardinessTransfer(senderPerson_id, receiverPerson_id, web3.utils.toWei(String(_coin), 'ether'), date, _studyId).send(
            { 
                from: myAccount[0],
                value: web3.utils.toWei(String(_coin), 'ether'),
                gas: 3000000 
            }
            );

        }
        // 지각자 정보 가져오는 쿼리
        async function callisNotAttendInfo(_studyId){
            const url = '/api/community/isNotAttend';
            var enter_date =  new Date();
            let s_year = enter_date.getFullYear();
            let s_month = enter_date.getMonth()+1;
            let s_date = enter_date.getDate();
            
            let attendance_start_date = s_year + '-'+s_month+ '-'+s_date;
            return post(url,  {
                study_id: _studyId,
                attendance_start_date: attendance_start_date
            });
        }

        async function callCurrentPeopleInfo(_studyId){
            const url = '/api/studyItems/view_currentPeople';

            return post(url, {
                study_id: _studyId
            });      
        }
        // 지각자 DB에 넣는 쿼리
        async function isNotAttendStatus(_studyId, userId, _attendance_date, _attendance_view, is_attendance,valid_attendance_time){
            const url = '/api/community/isAttendStatus';

            return post(url, {
                study_id: _studyId,
                user_id: userId,
                attendance_start_date: _attendance_date,
                attendance_start_time: _attendance_view,
                is_attendance: is_attendance,
                valid_attendance_time: valid_attendance_time
            });       
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
         
        // 최초 출석자인지 확인
        async function isFirstAttend(attendance_date){
            const url = '/api/community/isFirstAttend';
            
            return post(url, {
                study_id: _studyId,
                attendance_start_date: attendance_date
            });
        }
        // 시간 감소시켜 화면에 출력하는 메소드
        function msg_time(_studyId){
            //var hours = Math.floor((RemainDate % (1000 * 60 * 60 * 24)) / (1000*60*60));
            var miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000*60));
            var seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);
        
            var m = miniutes + "분  " + seconds + "초"; // 남은 시간 text형태로 변경

            $('#timer').text(m);

            if (RemainDate < 1000) {
                clearInterval(tid);   // 타이머 해제 

                // (예정)거래 진행 테이블에서 거래 여부가 없을 때만 실행 되어야 함.
                let check_date = new Date();
                let c_year = String(check_date.getFullYear());
                let c_month = String(check_date.getMonth()+1);
                let c_date = String(check_date.getDate());

                let c_hour = String(check_date.getHours());
                let c_minute = String(check_date.getMinutes());
                let c_second = String(check_date.getSeconds());

                let attendance_date = c_year+'-'+c_month+'-'+c_date;
                let attendance_view = c_hour+':'+c_minute+':'+c_second;
                

                // 최초 출석자있는 경우에만 처리 진행
                isFirstAttend(attendance_date).then((res)=>{
                    let num_of_attendance = res.data.length;
                    
                    if(num_of_attendance !== 0){
                        let valid_attendance_time = res.data[0].valid_time;
                        callCurrentPeopleInfo(_studyId).then((res_studyjoin_person)=>{
                            let _coin = String(0.001 / (res_studyjoin_person.data.length - 1)).substring(0 , 6);
                            console.log(_coin);

                            callisNotAttendInfo(_studyId).then((res_personId)=>{
                                // 지각하지 않은 사람이 지각한 사람 한 사람당 받는 코인 값
                                // 9를 6까지 줄여도 될 것같음
                                
                       
                                // 위에가 진짜임. 밑에 한줄은 test용
                                // let _coin = 2;
                                for(let i = 0; i < res_personId.data.length; i++){
                                    // 출석 미완료자 DB에 넣는 부분
                                    isNotAttendStatus(_studyId, res_personId.data[i].person_id, attendance_date, attendance_view, 0, valid_attendance_time).then((res)=>{
                                        // console.log(res);
            
                                        // 지각 거래 스마트 계약 함수 실행 부분
                                        let senderPerson_id = res_personId.data[i].person_id;
                                        let receiverPerson_id = sessionStorage.getItem("loginInfo"); 
                                        let attendance_date = new Date();
                                        let a_year = String(attendance_date.getFullYear());
                                        let a_month = String(attendance_date.getMonth()+1);
                                        let a_date = String(attendance_date.getDate());
                                        let _date = a_year + '-' + a_month + '-' + a_date;
            
                                        console.log(res_personId.data[i].person_id);
                                        setTardinessTransfer(senderPerson_id, receiverPerson_id, _date, _studyId, _coin);
                                    });
                                }
                                // chargeTheCoin(1,'0x89d24B7DE8a5e45f7ad5C22B2a4a7a2d3Da4dA28','0xc4a8d09d883D1d515933a29C2637efe634bb82AF');
                           
                            
                            });
                        });
                        
                    } 

                });
               

                $('#btn_attendance_check').val('출석 종료'); 

                var m = "00분 00초"; // 남은 시간 text형태로 변경
                $('#timer').text(m);
                
                // 타이머 작동하면 시간 선택 불가
                $('#valid_attendance_time').attr("disabled","disabled");    
                // 타이머 작동하면 버튼 선택 불가 
                $('#btn_attendance_check').attr("disabled","disabled");

                isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                    console.log(res.data);
                    
                    // 출석 결과가 DB에 삽입이 잘 된 경우
                    if(res.data.length !== 0){
                        
                        // 유효시간 끝나면 출석종료와 출석 완료 버튼 색 적용
                        if(res.data[0].is_attendance === 1){
                            $('#completion').text('출석 완료'); 
                            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
                        }
                        // 유효시간 지났는데도 출석체크가 안된 경우 
                        else {
                            $('#completion').text('출석 미완료'); 
                            $('#completion').attr('style',  'background-color:rgb(255, 80, 80) !important; border-color:rgb(255, 80, 80) !important;');
                        }
                    }
                    // 출석 결과가 DB에 삽입이 잘 안 된 경우 
                    else{
                        $('#completion').text('출석 미완료');  
                        $('#completion').attr('style',  'background-color:rgb(255, 80, 80) !important; border-color:rgb(255, 80, 80) !important;');
                    }
                });
            } else{
                RemainDate = RemainDate - 1000; // 남은시간 - 1초
            }
        }
    }

    // 출석 시간 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();
        
        // 타이머 작동하면 시간 선택 불가
        $('#valid_attendance_time').attr("disabled","disabled");    
        // 타이머 작동하면 버튼 선택 불가 
        $('#btn_attendance_check').attr("disabled","disabled");
        $('#btn_attendance_check').val('출석 중');  

        let start_date = new Date();
        let s_year = String(start_date.getFullYear());
        let s_month = String(start_date.getMonth()+1);
        let s_date = String(start_date.getDate());
        let start_date_view = s_year+'-'+s_month+'-'+s_date;

        // 최초 출석자인지 확인
        this.isFirstAttend(start_date_view).then((res)=>{
            let num_of_attendance = res.data.length;
            $('#completion').text('출석 완료'); 
            $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');               
        
            // 최초 출석자인 경우
            if(num_of_attendance === 0){
                this.isAttendStatus(1).then((res)=>{
                    console.log(res);
                    // 출석 유효시간 측정 타이머 
                    this.setAttendance(this.state.studyId, this.state.userId);
                    // $('#completion').text('출석 완료');  
                    // $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');          
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
                
                var seconds = Math.floor((startMoment % (1000 * 60)) / 1000);
                // var seconds = 59;

                let valid_add_time = new Date(startDate+' '+hours+':'+ miniutes+':'+seconds);
                let my_attentdance_dateTime = new Date();

                // console.log(valid_add_time);

                // 유효 시간 내에 출석을 완료한 경우
                if( my_attentdance_dateTime <= valid_add_time){
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
                        first_start_time_view: start_time_view, // 최초 출석자 시각
                        valid_attendance_time: res.data[0].valid_time
                    });
                   
                    // 출석 완료
                    this.isAttendStatus(1);

                    $('#btn_attendance_check').val('출석 중');  
                    $('#completion').text('출석 완료'); 
                    $('#completion').attr('style',  'background-color:rgb(117, 165, 209) !important; border-color:rgb(117, 165, 209) !important;');
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
    isFirstAttend = async (_start_date_view) => {
        const url = '/api/community/isFirstAttend';
        
        return post(url, {
            study_id: this.state.studyId,
            attendance_start_date: _start_date_view
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