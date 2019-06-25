import React, { Component } from 'react';
import './AboutCommunity.css';
import $ from 'jquery';
import { post } from 'axios';
import ProgressBar from './ProgressBar';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';

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
            is_end: 0,
            
            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            isTardinessTransfer:false
        }
    }

    // 출석체크 정책 유의사항 modal
    attendanceCautionConfirm = () => {
        confirmAlert({
            message: '미출석자는 자신을 제외한 스터디원들에게 코인을 자동 지불하게 됩니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 접속한 스터디가 종료된 스터디인지 확인
    callStudyIsEnd = async () => {
        const url = '/api/community/isEnd';

        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid")
        });
    }

    componentWillMount = async () => {
        // this.callStudyIsEnd().then((res)=>{
        //     if(res.data.length!== 0){
        //         // 스터디 종료 여부 (1: end, 0:not end)
        //         let is_end = res.data[0].is_end; 
        //         this.setState({
        //             is_end: is_end
        //         });
        //         this.initContract();
        //         // if(is_end === 0){
        //         //     this.initContract();
        //         // }
        //     }
        // });
        // this.initContract();
    };

    componentDidMount= async () => {
        this.callStudyIsEnd().then((res)=>{
            // if(res.data.length!== 0){
                // 스터디 종료 여부 (1: end, 0:not end)
                let is_end = res.data[0].is_end; 
                this.setState({
                    is_end: res.data[0].is_end
                });
                console.log('is_end: ');
                console.log(res.data[0].is_end);
                // if(is_end === 0){
                    
                // }
            // } 
            
        });

        this.initContract().then(()=>{
            this.attendanceCautionConfirm();
            this.make_tag();
                this.getUserNameSession().then(()=>{
                    // 사용자 ID, 들어온 스터디 번호 불러오기
                    this.getEnterSession().then(()=>{
                       
                        this.getPersonInfoOfStudy(this.state.studyId,this.state.userId);
    
                        // 출석 시작 버튼을 누른 오늘 시간
                        let today_date = new Date();
                        let today_year_str = String(today_date.getFullYear());
                        let today_month_str = String(today_date.getMonth()+1);
                        let today_day_str = String(today_date.getDate());
    
                        let today_date_view = today_year_str+'-'+today_month_str+'-'+today_day_str;
                       
                        // *자신*이 최초 출석자인지 확인
                        this.isFirstAttendee(today_date_view, this.state.userId).then((res)=>{
                            console.log(res.data.length);
    
                            // 자신이 오늘 출석체크의 최초 출석자인 경우
                            if (res.data.length !== 0) {
                                $('.cancel_attendance_btn').val('출석 취소'); 
                            }
                            // 자신이 오늘 출석체크의 최초 출석자가 아닌 경우
                            else {
                                $('.cancel_attendance_btn').attr("disabled","disabled");
                                $('.cancel_attendance_btn').val('출석 취소 불가'); 
                            }
                        });
    
                        // 최초 출석자인지 확인
                        this.isFirstAttend(today_date_view).then((res)=>{
                            let today_attendance = res.data.length;
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
                                }
    
                                var miniutes = Number(first_attend_valid_time) + Math.floor((first_attend_dateTime % (1000 * 60 * 60)) / (1000*60));
                                if(miniutes >= 60){ 
                                    hours = hours + 1;
                                    miniutes = miniutes - 60;
                                }
                                var seconds = Math.floor((first_attend_dateTime % (1000 * 60)) / 1000);
    
                                let valid_add_time = new Date(first_attend_date+' '+hours+':'+ miniutes+':'+seconds);
                                this.setState ({
                                    edDate: valid_add_time // 타이머 종료 시간을 출석 시간 마지노선 시간으로 설정
                                });
                               
                                // 최초 출석자 아니면 시간 선택 불가
                                $('#valid_attendance_time').val(first_attend_valid_time); 
                                $('#valid_attendance_time').attr("disabled","disabled");  
    
                                // // 출석취소 기능 비활성화
                                // $('.cancel_attendance_btn').attr("disabled","disabled");
                                // $('.cancel_attendance_btn').val('출석 취소 불가'); 
                                
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
            console.log(web3);
            console.log(myAccount);
        //   Set web3, accounts, and contract to the state, and then proceed with an
        //   example of interacting with the contract's methods.
        this.setState({ web3, myAccount, studyGroupInstance: instance});
        
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
        var person_name =  web3.utils.toAscii(result[3]);
        console.log('memberAddress: ' + memberAddress);
        console.log('person_id: ' + person_id);
        console.log('study_id: ' + study_id);
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
        let e_year = stDate.getFullYear();
        let e_month = stDate.getMonth()+1;
        let e_date = stDate.getDate();
        let e_hour = stDate.getHours();
        let e_minute = stDate.getMinutes() + Number(this.state.valid_attendance_time);
        let e_second = stDate.getSeconds();

        var edDate = 0;
        // 출석체크 거래 유의사항 modal
        function attendanceTransactionConfirm() {
            confirmAlert({
                title: '출석체크가 종료되었습니다.',
                message: '약 1분내로 코인관리 화면에 반영됩니다.',
                buttons: [
                    {
                        label: '확인'
                    }
                ]
            })
        }
        
        // 출석체크 진행 중인 경우
        if (this.state.edDate !== null) {  
            edDate = this.state.edDate.getTime();

            $('#btn_attendance_check').val('출석 중'); 

            isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                
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
       
            edDate =  new Date(e_year+'-'+e_month+'-'+e_date+' '+e_hour+':'+e_minute+':'+e_second).getTime(); // 종료시간
        }    

        stDate = stDate.getTime(); // 시작시간
        var RemainDate = edDate - stDate; // 잔여시간

        // 스마트 계약 지각 거래발생
        async function setTardinessTransfer (_latecomer_accountIdx,_senderPerson_id, _receiverPerson_id, _date,_studyId,_coin){
        
            // String타입 date32타입으로 변환 
            let date = web3.utils.fromAscii(_date);
            let senderPerson_id = web3.utils.fromAscii(_senderPerson_id);
            let receiverPerson_id = web3.utils.fromAscii(_receiverPerson_id);
            let ether = String(_coin / 10).substring(0 , 9);

            // sender가 receiver에세 n코인 만큼 _date일시에 보냈다는 거래 내역을 저장하는 부분
            studyGroupInstance.methods.setTardinessTransfer(senderPerson_id, receiverPerson_id, web3.utils.toWei(String(_coin), 'ether'), date, _studyId).send(
            { 
                from: myAccount[Number(_latecomer_accountIdx)],
                value: web3.utils.toWei(String(ether), 'ether'),
                gas: 0 
            });

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

        // 지각자 DB에 넣는 쿼리
        async function isNotAttendStatus(_studyId, userId, _attendance_date, _attendance_view, is_attendance,valid_attendance_time){
            const url = '/api/community/isAttendStatus';

            return post(url, {
                study_id: _studyId,
                user_id: userId,
                attendance_start_date: _attendance_date,
                attendance_start_time: _attendance_view,
                is_attendance: is_attendance,
                valid_attendance_time: valid_attendance_time,
                is_first : false
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

        // 최초 거래인지 확인
        async function statusOfTardinessTransaction(attendance_date){
            const url = '/api/community/tardiness_deal_status';
            return post(url, {
                study_id: _studyId,
                transaction_date: attendance_date
            });
        }

        async function receiver_list(tardiness_id){
            const url = '/api/community/receiver_list';
            return post(url, {
                study_id: _studyId,
                person_id: tardiness_id
            });
        }

        async function inert_status_of_tardiness(transaction_date, tardiness_status){
            const url = '/api/community/inert_status_of_tardiness';
            return post(url, {
                study_id: _studyId,
                transaction_date: transaction_date,
                tardiness_status: tardiness_status
            });
        }
        
        // 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자
        async function attendance_trading_authority(transaction_date){
            const url = '/api/community/attendanceTradingAuthority';
            return post(url, {
                study_id: _studyId,
                transaction_date: transaction_date,
                person_id: sessionStorage.getItem("loginInfo")
            });
        }

        //지각자의 계좌 index 얻어오기
        async function getLatecomerAccountId(latecomer_id){
            const url = '/api/community/getLatecomerAccountId';
            return post(url, {
                study_id: _studyId,
                latecomer_id: latecomer_id
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
                
                // 조건 거래 검증
                // 최초 출석자있는 경우에만 처리 진행
                isFirstAttend(attendance_date).then((res)=>{
                    let num_of_attendance = res.data.length;
                    
                    if(num_of_attendance !== 0){
                        let valid_attendance_time = res.data[0].valid_time;
                        
                            callisNotAttendInfo(_studyId).then((res_personId)=>{
                                for(let i = 0; i < res_personId.length; i++){
                                    // 출석 미완료자 DB에 넣는 부분
                                    isNotAttendStatus(_studyId, res_personId.data[i].person_id, attendance_date, attendance_view, 0, valid_attendance_time).then((res)=>{

                                        //블록체인 거래 내역가 있는지 확인
                                        statusOfTardinessTransaction(attendance_date).then((res)=>{
                                            // console.log(res.data.length);
                                            let senderPerson_id = res_personId.data[i].person_id;
                                            // let receiverPerson_id = sessionStorage.getItem("loginInfo"); 
                                            let attendance_date = new Date();
                                            let a_year = String(attendance_date.getFullYear());
                                            let a_month = String(attendance_date.getMonth()+1);
                                            let a_date = String(attendance_date.getDate());
                                            let _date = a_year + '-' + a_month + '-' + a_date;

                                            // 각 지각한 사람 제외의 스터디원 배열 쿼리
                                            receiver_list(res_personId.data[i].person_id).then((res_studyjoin_person)=>{
                                                // 지각하지 않은 사람이 지각한 사람 한 사람당 받는 코인 값
                                                let latecomer_coin = 0.1;
                                                let _coin = String(latecomer_coin / (res_studyjoin_person.data.length)).substring(0 , 6);
                                                console.log(_coin);
                                                let receive_list = res_studyjoin_person.data;

                                                //블록체인 거래 내역이 있다면?
                                                if(res.data.length === 1){
                                                    // 거래 내역이 true인지, 거래취소 false인지 판별
                                                    // false일때만 거래 진행 허용 = 거래 취소 후 재 거래 시도할 경우
                                                    if(res.data[0].transaction_status === false){
                                                        // insert하는 형식이 아닌 update로 값을 넣어줘야 함.
                                                        attendance_trading_authority(_date).then((is_first_res)=>{
                                                            console.log(is_first_res);
                                                            console.log(is_first_res.data.length);
                                                            // 최초 출석자라면 거래 진행
                                                            if(is_first_res.data.length === 1){
    
                                                                inert_status_of_tardiness(_date, true).then(()=>{
                                                                    for(let i = 0; i < receive_list.length; i++){
                                                                        let receiverPerson_id = receive_list[i].person_id;
                                                                            console.log(senderPerson_id+'->'+receiverPerson_id + '로 '+_coin+'코인 지급');
                                                                            // 지각자의 계좌 index 얻어오기
                                                                            getLatecomerAccountId(senderPerson_id).then((latecomer_data)=>{
                                                                                
                                                                                let latecomer_id = latecomer_data.data[0].account_index;
                                                                                console.log(latecomer_id);
                                                                                // 지각 거래 스마트 계약 함수 실행 부분 실행
                                                                                setTardinessTransfer(latecomer_id, senderPerson_id, receiverPerson_id, _date, _studyId, _coin);
                                                                            });
                                                                    }
                                                                });   
                                                            }
                                                        });
                                                    }
                                                } 
                                                //  블록체인거래 내역이 없다면 거래 진행 허용
                                                else{
                                                    // 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자
                                                    attendance_trading_authority(_date).then((is_first_res)=>{
                                                        if(is_first_res.data.length === 1){
                                                            // DB에 미출석자 지각 처리
                                                            inert_status_of_tardiness(_date, true).then(()=>{
                                                                for(let i = 0; i < receive_list.length; i++){
                                                                    let receiverPerson_id = receive_list[i].person_id;
                                                                    // 지각자의 계좌 index 얻어오기
                                                                    getLatecomerAccountId(senderPerson_id).then((latecomer_data)=>{
                                                                        let latecomer_id = latecomer_data.data[0].account_index;
                                                                        console.log(latecomer_id);
                                                                            // 지각 거래 스마트 계약 함수 실행 부분 실행
                                                                        setTardinessTransfer(latecomer_id, senderPerson_id, receiverPerson_id, _date, _studyId, _coin);
                                                                    });
                                                                }
                                                                attendanceTransactionConfirm(); 
                                                            });
                                                        }
                                                    });
                                                }

                                            });

                                        });
                                    });
                                }
                                // chargeTheCoin(1,'0x89d24B7DE8a5e45f7ad5C22B2a4a7a2d3Da4dA28','0xc4a8d09d883D1d515933a29C2637efe634bb82AF');
                            });  
                    } 
                });

                $('#btn_attendance_check').val('출석 종료'); 

                var minsecond = "00분 00초"; // 남은 시간 text형태로 변경
                $('#timer').text(minsecond);
                
                // 타이머 작동하면 시간 선택 불가
                $('#valid_attendance_time').attr("disabled","disabled");    
                // 타이머 작동하면 버튼 선택 불가 
                $('#btn_attendance_check').attr("disabled","disabled");

                isAttendanceRateBtn(_studyId, _userId).then((res)=>{
                    
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
                this.isAttendStatus(1, true).then((res)=>{
                   
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

                let valid_add_time = new Date(startDate+' '+hours+':'+ miniutes+':'+seconds);
                let my_attentdance_dateTime = new Date();

                // 유효 시간 내에 출석을 완료한 경우
                if( my_attentdance_dateTime <= valid_add_time){

                    this.setState ({
                        first_start_date_view: res.data[0].attendance_start_date, // 최초 출석자 날짜
                        first_start_time_view: res.data[0].attendance_start_time, // 최초 출석자 시각
                        valid_attendance_time: res.data[0].valid_time
                    });
                   
                    // 출석 완료
                    this.isAttendStatus(1, false);

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

    // 최초 출석자에 따라 출석 취소 버튼 활성화하기 위한 자신이 최초 출석자인지 확인
    isFirstAttendee = async(_start_date_view, user_id) => {
        const url = '/api/community/isFirstAttendee';
        
        return post(url, {
            study_id: this.state.studyId,
            person_id : user_id,
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

        return post(url, {
            study_id: this.state.studyId,
            user_id: this.state.userId,
            attendance_start_date: start_date_view,
            attendance_start_time: start_time_view,
            is_attendance: is_attendance,
            valid_attendance_time: this.state.valid_attendance_time,
            is_first : is_first
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
            let text = '<option>'+i+'</option> 분';
            $("#valid_attendance_time").append(text);
        }
    }
    
    render() {
        
        return(
            <div className="div_attendance_check">
                {/* 진행중인 스터디인가? */}
                {this.state.is_end === 0?
                    <div>
                        {this.state.web3 ? 
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
                                            <span>분</span>
                                        </div>
                                        <div>
                                            <input type="submit" value="출석 시작" className="btn btn-danger" id="btn_attendance_check"  />
                                        </div>
                                    </form> 
                                    <div className="attend_status">
                                        <div className="btn btn-danger" id="completion">출석 미완료</div>
                                        <input type="button" className="btn btn-outline-danger btn-lg btn-block cancel_attendance_btn" id="cancel_attendance_btn"  />
                                    </div>
                                    <div className="cancel_btn_desc">
                                        <span className="cancel_btn_desc_1">★ 출석 취소 버튼은 </span>
                                        <span className="cancel_btn_desc_2">최초 출석자만 가능합니다. ★</span>
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
                
            </div>
        );
    }
}

export default AttendanceCheck;