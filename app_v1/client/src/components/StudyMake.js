import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import $ from 'jquery';

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

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            account_pw:'',

            study_start_date: '',
            study_end_date: new Date(),

            dbStartDate:'',
            dbEndDate: ''
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
        const {myAccount, web3} = this.state; 
       
        // (예정) 계정 생성 전에 DB에 접근하여 중복되는 비밀번호 있는지 검사하고나서, 중복되는 게 없는 경우에만 회원가입 진행
        
        // 계정 생성 
        //var account_pw = this.state.account_pw;
        let account_pw = $('#study_make_pw').val();
        await web3.eth.personal.newAccount(account_pw);
        console.log('사용된 패스워드: ' + account_pw);
        // 계좌가 생성되었기 때문에 계좌목록 State값 갱신해야 한다. 
        let myAccount_new = await web3.eth.getAccounts();
        this.setState({
            myAccount: myAccount_new
        });

        // 마지막에 생성된 계정 index구하기
        // 바로 setState한거 적용 안되기 때문에 state값 안 가져다 사용.
        var account_id =  myAccount_new.length - 1;
        console.log(account_id);
    
        // DB 저장 시 계정 index값과 비밀번호, hash계정 값 저장해야함.
        var account_num = myAccount_new[account_id];
        console.log('['+(account_id)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났고, 비밀번호는 ' + account_pw);
    
        
        // DB에 값 삽입
        this.callCreateAccountApi(this.state.person_id, account_id, account_num, account_pw,_study_id).then((response) => {
            //console.log(response.data);
            console.log(this.state.person_id +' '+account_id+' '+account_num+' '+account_pw);
            
        }).catch((error)=>{
        console.log(error);
       
        });
        return account_id;
        // this.createTheStudy(0,account_num, 'person', 1, 40);
    }
    // 블록체인 계좌생성 후 DB에 account_list에 삽입. 
    callCreateAccountApi = (_person_id,_account_id,_account_num,_account_pw,_study_id) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_id: _account_id,
            account_num: _account_num,
            account_pw: _account_pw,
            study_id : _study_id
        });
    }
    // 매개변수로 들어온 _account_id에게 ether 지급.
    chargeTheCoin = async (_account_id) =>{
        const { studyGroupInstance, myAccount, web3} = this.state; 
        let study_make_coin = $('#study_make_coin').val();
        // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
        studyGroupInstance.methods.chargeTheCoin(myAccount[_account_id]).send(
          {
            from: myAccount[0], 
            value: web3.utils.toWei(study_make_coin, 'ether'),
            // gasLimit 오류 안나서 일단은 gas:0 으로 했지만 오류 나면 3000000로 바꾸기
            gas: 0 
          }
        );
        setTimeout(function(){
            web3.eth.getBalance(myAccount[_account_id]).then(result=>{
                console.log('이체 후 잔액은: ' + web3.utils.fromWei(result, 'ether'));
            });
        }, 1000);
    }

    componentDidMount() {
        this.make_tag();
        this.getSession();  

        let stDate = new Date();
        let formatted_stDate = '';
        let db_formatted_stDate = '';
        let amPm = '';
        let hour = '';

        if(stDate.getHours() >= 12){
            amPm = '오후';
            if(stDate.getHours() == 12){
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
                        this.createAccount(insert_id).then((account_id)=>{
                            this.setState({
                                study_id: insert_id
                            });
                            this.chargeTheCoin(account_id).then(()=>{
                                // .sol파일의 studyMember구조체 생성
                                let person_id = this.state.person_id;
                                //let memberAddress = account_num;
                                let join_coin = this.state.study_coin;
                                this.createMemberItem(this.state.study_id , person_id, account_id, join_coin);
                                this.props.history.push('/mainPage'); 
                            });
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
        const url = '/api/studyItems/leader';
        console.log(studyId);
        return post(url,  {
            study_id: studyId,
            person_id: this.state.person_id,
            leader: true,
            // account_number: '11-22'
        
            // personPw: this.state.personPw,
            // personPw2: this.state.personPw2,
            // personName:this.state.personName
        });
    }

     // session 불러오기
    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id : sessionStorage.getItem("loginInfo")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    componentWillMount = async () => {
        this.initContract();
    };

    
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
      
      
          // 확인용 로그
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

    studyExchenageConfirm = () => {
        confirmAlert({
            title: '[  코인을 충전하시겠습니까?  ]',
            message: this.state.study_coin+'코인 충전 시 '+ (5000*this.state.study_coin)+'원 입니다.(1코인당 5000원)',
            buttons: [
            {
                label: '네',
                onClick: () => this.handleFormOkSubmit()
            },
            {
                label: '아니요',
                onClick: () => alert('아니오')
            }
          ]
        })
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


    // StudyGroup.sol파일의 studyMember구조체 생성
    createMemberItem = async (_study_id, _person_id ,_account_id, _numOfCoins) => {
        const { studyGroupInstance, myAccount, web3} = this.state; 
        let _memberAddress = myAccount[_account_id];
        // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
        let Ascii_person_id =  web3.utils.fromAscii(_person_id); 
        console.log(_study_id,_person_id,_memberAddress,_numOfCoins);
        studyGroupInstance.methods.setPersonInfoOfStudy(_study_id, Ascii_person_id, _memberAddress,_numOfCoins).send(
        {
                from: myAccount[0], // 관리자 계좌
                gas: 3000000 
        }
        );
    }
    
    render() {
        return (
            <div className="out_study_make_frame">
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
                            <div className = "end_date_desc">★ Study 종료 날짜에 따라 잔여 코인을 반환 받을 수 있습니다. ★</div>                       
                            <br/>
                        </div>

                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 모집 인원(명) </label>
                            <span className="dotdot">:</span>
                                <select className="form-control" id="study_make_total_number" name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
                                </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 가입 코인: </label>
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
                    
                </div>
            </div>
        );
    }
}


export default StudyMake;