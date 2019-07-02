import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import $ from 'jquery';
import ProgressBar from './ProgressBar';
import DateTimePicker from 'react-datetime-picker';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';
// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class StudyMake extends Component {
    constructor(props) {
        super(props);
        this.state = {
            study_name: '' ,
            study_type: 'TOEIC',
            num_people: '2',
            study_desc: '',
            study_coin: '1',
            person_id: '', 
            study_id: '',
            person_name:'',
            account_idx: 0,

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            account_pw:'',
            transactionReceiptOfMemberItem:'', // 사용자 등록 트랜잭션 채굴 확인용
            // transactionReceiptOfChargeTheCoin: '', // 사용자 이더 충전 트랜잭션 채굴 확인용
            isMemberItemTransfer: false, // 사용자 등록 트랜잭션 발생 유무
            // isChargeTheCoin: false, // 사용자 이더 충전 트랜잭션 발생 유무
            isEndTransfer: false, // 스터디 구조체 생성 트랜잭션 발생 유무

            study_start_date: '',
            study_end_date: new Date(),

            dbStartDate:'',
            dbEndDate: '',

            // progress 
            completed: 0
        }
    }

    onEndDateChange = study_end_date => {
        this.setState({ study_end_date });
    }

    // 입력 유무 판단
    check(){
        let study_name = $('#study_make_name').val();
        let study_type = $('#study_make_subject').val();
        let num_people = $('#study_make_total_number').val();
        let study_coin = $('#study_make_coin').val();
        let study_make_pw = $('#study_make_pw').val();
        let study_desc = $('#study_make_long_desc').val();

        if((study_name !== '')&&(study_type !== '')&&(this.state.study_end_date !== '')&&(num_people !== '')&&(study_coin !== '')&&(study_make_pw !== '')&&(study_desc !== '')){
            return true;
        } else{
            return false;
        }                                      
    }

    createAccount = async (_study_id) =>{
        // 계정 생성 
        let account_pw = $('#study_make_pw').val();
        console.log('사용된 패스워드: ' + account_pw);
        
        this.selectFromInitAccountList().then((init)=>{
            console.log('226줄 account_idx: '+this.state.account_idx);
            if(init.length === 1){
                // 계좌 번호
                let account_num = init[0].account_num;
           
                // DB에 값 삽입 account_num 
                this.callCreateAccountApi(this.state.person_id, this.state.account_idx,
                    account_num, account_pw, _study_id).then((response) => {
                    console.log(this.state.person_id +' '+this.state.account_idx+' '+account_pw);
                    this.useInitAccount(this.state.account_idx).then((res)=>{
                        console.log(res);
                        
                    });

                }).catch((error)=>{
                console.log(error);
            
                });
                
            } else{
                console.log("계좌 생성시 오류");
            }
        });
    }

    // 블록체인 계좌생성 후 DB에 account_list에 삽입. 
    callCreateAccountApi = (_person_id,_account_index,_account_num,_account_pw,_study_id) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_index: _account_index,
            account_num: _account_num,
            account_pw: _account_pw,
            study_id : _study_id
        });
    }

    // 계좌 불러오기
    selectFromInitAccountList  = async () => {
        const url = '/api/selectFromInitAccountList';
        const response = await fetch(url);
        const body = await response.json();
        
        // 배정할 계좌의 인덱스 저장
        if(body.length === 1){
            this.setState({
                account_idx : body[0].account_index
            });
        }
        return body;
    }
    // 계좌 속성 변경
    useInitAccount = async (_account_index) => {
        const url = '/api/useInitAccount';
        console.log(_account_index);
        return post(url,  {
            account_index: _account_index
        });
    }
    
    // // 매개변수로 들어온 _account_id에게 ether 지급.
    // chargeTheCoin = async () =>{
    //     const { studyGroupInstance, myAccount, web3} = this.state; 
    //     // 1 코인당 0.1ether를 충전하기 위한 변환 과정
    //     let study_make_ether = this.state.study_coin / 10;
    //     let account_id = Number(this.state.account_idx);
    //     // myAccount[account_id] <- 이 계좌가 받는 사람 계좌.
    //     studyGroupInstance.methods.chargeTheCoin(myAccount[account_id]).send(
    //       {
    //         from: myAccount[0], 
    //         value: web3.utils.toWei(String(study_make_ether), 'ether'),
    //         gas: 0 
    //       })
    //       // receipt 값이 반환되면 트랜잭션의 채굴 완료된 상태
    //       .on('confirmation', (confirmationNumber, receipt) => {
    //           let transactionReceiptOfChargeTheCoin = receipt;
    //           this.setState({
    //               transactionReceiptOfChargeTheCoin:transactionReceiptOfChargeTheCoin
    //           });
    //           // 이더 충전 트랜잭션 채굴 완료 상태 설정
    //           this.setState({
    //               isChargeTheCoin: false
    //           });
    //       });
    // }

    componentDidMount() {
        this.initContract().then(()=>{
            this.make_tag();
            this.getSession();  
            this.timer = setInterval(this.progress, 20); 

            let stDate = new Date();
            let formatted_stDate = '';
            let db_formatted_stDate = '';
            let amPm = '';
            let hour = '';

            if(stDate.getHours() >= 12){
                amPm = '오후';
                if(stDate.getHours() === 12){
                    hour = stDate.getHours();
                } else{
                    hour = stDate.getHours() - 12;
                }
                formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" "+amPm+" "+hour+":"+stDate.getMinutes();
            
            } else{
                amPm = '오전';
                formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" "+amPm+" "+stDate.getHours()+":"+stDate.getMinutes();
            }
            db_formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" " + stDate.getHours()+":"+stDate.getMinutes();
            this.setState({
                study_start_date: formatted_stDate,
                dbStartDate: db_formatted_stDate
            });
        });
    }
    
    handleFormSubmit = (e) => {
        // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
        e.preventDefault();

        if(this.check() === true){
            this.getStudyEndDate();
            setTimeout(()=>{
                this.addstudyItem()
                .then((response) => {
                console.log(response.data);
                let insert_id = response.data.insertId;
                setTimeout(
                    this.addleader(insert_id).then(() =>{
                        this.setState({
                            isMemberItemTransfer: true, // 사용자 등록 트랜잭션 발생 
                            // isChargeTheCoin: true,  // 이더 충전 트랜잭션 발생
                            isEndTransfer: true // 스터디 구조체 생성 트랜잭션 발생
                        });
                        this.createAccount(insert_id).then((account_id)=>{
                            this.setState({
                                study_id: insert_id
                            });
                            setTimeout(()=>{
                                // 이더 충전 트랜잭션 발생
                                // this.chargeTheCoin(account_id).then(()=>{
                                    // StudyGroup.sol파일의 studyMember구조체 생성
                                    let person_id = this.state.person_id;
                                    // 사용자 등록 트랜잭션 발생 
                                    this.createMemberItem(this.state.study_id , person_id, this.state.account_idx,this.state.person_name);
                                    this.setStudyEndTransfer(this.state.study_id, this.state.study_end_date);
                                    let second = 1000;
                                    let intervalTime = second * 2;
 
                                    var refreshIntervalId = setInterval(()=>{
                                        if((this.state.transactionReceiptOfMemberItem !== '')&&(this.state.isMemberItemTransfer !== '')){
                                            /* refreshIntervalId 중지 */
                                            clearInterval(refreshIntervalId);
                                            setTimeout(()=>{
                                                this.studyOkJoinConfirm();
                                            },100);
                                            this.props.history.push('/mainPage');
                                        }
                                    },intervalTime);
                                // });
                            }, 1000);
                        });
                    }), 100);
                })    
            }, 100);    
        } else{
            this.inputConfirm();
        }  
    }
    
    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }
    
    addstudyItem = () => {
        const url = '/api/studyItems';
        
        return post(url,  {
            study_name: this.state.study_name,
            study_type: this.state.study_type,
            num_people: this.state.num_people,
            study_start_date: this.state.dbStartDate,
            study_end_date: this.state.dbEndDate,
            study_desc: this.state.study_desc,
            study_coin: this.state.study_coin
        });
    }

    addleader = (studyId) => {
        const url = '/api/insert/study_join';
        console.log(studyId);
        return post(url,  {
            study_id: studyId,
            person_id: this.state.person_id,
            leader: true
        });
    }

    // session 불러오기
    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id : sessionStorage.getItem("loginInfo")});
            this.setState({person_name : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    componentWillMount = async () => {
        clearInterval(this.timer);
    };
    
    // web3, 이더리움 계좌목록, 배포된 스마트 계약 인스턴스 연결 부분.
    initContract = async () => {
        try {
          // network provider와 web3 instance 얻기.
          const web3 = await getWeb3();
         
          // web3를 사용하여 사용자의 accounts 불러옴.
          const myAccount = await web3.eth.getAccounts();
    
          // Get the contract instance.
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = StudyGroup.networks[networkId];
          const instance = new web3.eth.Contract(
            StudyGroup.abi,
            deployedNetwork && deployedNetwork.address
          );
      
          if(web3 !== null){
                console.log("web3연결 성공");
                console.log(instance);
            } else{
                //web3연결 실패
                console.log("인터넷을 연결 시켜주세요.");
            }
        //   web3, 계좌목록, 스마트 계약 인스턴스 state에 저장.
        this.setState({ web3, myAccount, studyGroupInstance: instance});
      
        } catch (error) {
          alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }
    };
    
    make_tag = () =>{
        let subjects = ['TOEIC', 'TOFEL', '토익스피킹', 'OPIC', '전산 관련 자격증', 'GTQ', '한국사능력검정시험', '기타'];
        for(let i = 0; i < subjects.length; i++){
            $("#study_make_subject").append('<option>'+subjects[i]+'</option>');
        }

        for(let i = 2; i < 11; i++){
            $("#study_make_total_number").append('<option>'+i+'</option>');
        }

        for(let i = 1; i < 11; i++){
            $("#study_make_coin").append('<option>'+i+'</option>');
        }
    }
    
    getStudyEndDate = () =>{
        let year = $('.react-datetime-picker__inputGroup__year').val();
        let month = $('.react-datetime-picker__inputGroup__month').val();
        let cur_day = $('.react-datetime-picker__inputGroup__day').val();
        let amPm = $('.react-datetime-picker__inputGroup__amPm').val();
        let hour = $('.react-datetime-picker__inputGroup__hour').val();
        let minute = $('.react-datetime-picker__inputGroup__minute').val();

        var datetime = '';
        if(amPm === 'am'){
            datetime = year + "-" + month + "-" + cur_day + " " +  hour+":" + minute;
        } else if(amPm === 'pm'){
            if(hour === 12){
                datetime = year + "-" + month + "-" + cur_day + " " +  (hour) +":" + minute;
            }else {
                hour = String(Number(hour) + 12);
                datetime = year + "-" + month + "-" + cur_day + " " + hour +":" + minute;
            }
        }
        this.setState({
            dbEndDate: datetime
        });
    }

    inputConfirm = () => {
        confirmAlert({
            title: '모든 항목을 입력해주세요',
            buttons: [
            {
                label: '확인'
            }
          ]
        })
    }

    // 스터디 가입 완료 확인창
    studyOkJoinConfirm = () => {
        confirmAlert({
            title: '스터디에 가입되셨습니다.',
            message: '자세한 사항은 MyPage에서 확인 가능합니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // StudyGroup.sol파일의 studyMember구조체 생성
    createMemberItem = async (_study_id, _person_id ,_account_id, _person_name) => {
        const { studyGroupInstance, myAccount, web3} = this.state; 
        let _memberAddress = myAccount[_account_id];
        // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
        let Ascii_person_id =  web3.utils.fromAscii(_person_id); 
        let Ascii_person_name =  web3.utils.fromAscii(_person_name); 
        // 1 코인당 0.1ether를 충전하기 위한 변환 과정
        let study_make_ether = this.state.study_coin / 10;
        studyGroupInstance.methods.setPersonInfoOfStudy(_study_id, Ascii_person_id, _memberAddress,Ascii_person_name).send(
        {
                from: myAccount[0], // 관리자 계좌
                value: web3.utils.toWei(String(study_make_ether), 'ether'),
                gas: 6000000 
        }
        )
        // receipt 값이 반환되면 트랜잭션의 채굴 완료 된 상태
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('setPersonInfoOfStudy')
            console.log(receipt);
            let transactionReceiptOfMemberItem = receipt;
            this.setState({
                transactionReceiptOfMemberItem:transactionReceiptOfMemberItem
            });
            // 이더 충전 트랜잭션 채굴 완료
            this.setState({
                isMemberItemTransfer: false
            });
        });
    }
    
    // StudyGroup.sol파일의 스터디 정보 구조체 저장
    // uint _studyId, bytes32 _endDate, bool _isEndDateDeal
    setStudyEndTransfer = async (_studyId, _endDate) => {
        const { studyGroupInstance, myAccount, web3} = this.state; 
        let year  = _endDate.getFullYear();
        let month = _endDate.getMonth()+1;
        let date = _endDate.getDate();
        let day = year+'-'+month+'-'+date;
        // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
        let Ascii_endDate =  web3.utils.fromAscii(day); 
        console.log(day+'     '+ _studyId);
        studyGroupInstance.methods.setStudyEndTransfer(_studyId, Ascii_endDate).send(
        {
                from: myAccount[0], // 관리자 계좌
                gas: 6000000 
        }
        )
        // receipt 값이 반환되면 트랜잭션의 채굴 완료 된 상태
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('setPersonInfoOfStudy')
            console.log(receipt);
            let transactionReceiptOfEndTransfer = receipt;
            console.log('setStudyEndTransfer 완료');
            // 이더 충전 트랜잭션 채굴 완료
            this.setState({
                isEndTransfer: false
            });
        });
    }

    render() {
        return (
            <div className="pageBackgroundColor">
                {this.state.web3 ?
                <div className="study_make_screen">
                    <div className="study_make_header">
                        <div id="study_make_title">
                            STUDY 생성
                        </div>
                        <p id="study_make_desc">
                            - Study를 생성하는 사람이 팀장입니다.
                        </p>
                    </div>
                    <form className="study_make_form" onSubmit={this.handleFormSubmit}>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 명 </label>
                            <span className="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">종류 </label>
                            <span className="dotdot">:</span>
                            <select className="form-control" id="study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 시작 날짜 </label>
                            <span className="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_start_date" name='study_start_date' value={this.state.study_start_date} onChange={this.handleValueChange} disabled/>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 종료 날짜 </label>
                            <span className="dotdot">:</span>
                            <span id="study_make_end_date">
                                <DateTimePicker
                                    name = 'study_end_date'
                                    onChange={this.onEndDateChange}
                                    value={this.state.study_end_date}
                                />
                            </span>
                            <br/><br/>
                            <div className = "end_date_desc">★ Study 종료 날짜의 자정에 잔여 코인을 반환 받을 수 있습니다. ★</div>                        
                            <br/>
                        </div>

                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 모집 인원(명) </label>
                            <span className="dotdot">:</span>
                                <select className="form-control" id="study_make_total_number" name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
                                </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 가입 코인 (1코인당 10000원) </label>
                            <span className="dotdot">:</span>
                            <select className="form-control" id="study_make_coin" name='study_coin' value={this.state.study_coin}  onChange={this.handleValueChange}> 
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">코인지갑 비밀번호</label>
                            <span className="dotdot">:</span>
                            <input type="password" className="form-control" id="study_make_pw"/>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">설명 </label>
                            <textarea className="form-control" id="study_make_long_desc" rows="7" cols="50" name='study_desc' value={this.state.study_desc}  onChange={this.handleValueChange}></textarea>
                        </div>
                        <button type="submit" className="btn btn-outline-danger btn-lg btn-block " id="btn_study_make">STUDY 생성</button>

                    </form>
                    {(this.state.isMemberItemTransfer === false)&&(this.state.isEndTransfer === false)?
                    '':
                    <div className="progrss_bar_layer"> 
                        <div className="progress_bar_body">
                            <ProgressBar message ='스터디 생성 중...' sub_msg1 = "약 1분 정도 소요됩니다."
                            sub_msg2 = "잠시만 기다려주세요."/> 
                        </div>
                    </div>
                    }
                </div>
                :
                <ProgressBar message ='로딩중'/>}
            </div>
        );
    }
}

export default StudyMake;