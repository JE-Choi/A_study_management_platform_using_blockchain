import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import $ from 'jquery';

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
            study_period: '1',
            study_desc: '',
            study_coin: '1',
            person_id: '', 

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            account_pw:''
        }
    }

    // 입력 유무 판단
    check(){
        let study_name = $('#study_make_name').val();
        let study_type = $('#study_make_subject').val();
        let study_period = $('#study_make_period').val();
        let num_people = $('#study_make_total_number').val();
        let study_coin = $('#study_make_coin').val();
        let study_make_pw = $('#study_make_pw').val();
        let study_desc = $('#study_make_pw').val();

        if((study_name !== '')&&(study_type !== '')&&(study_period !== '')&&(num_people !== '')&&(study_coin !== '')&&(study_make_pw !== '')&&(study_desc !== '')){
            return true;
        } else{
            return false;
        }                                      
    }

    createAccount(){
        const { shopInstance, myAccount, web3} = this.state; 
       
        // (예정) 계정 생성 전에 DB에 접근하여 중복되는 비밀번호 있는지 검사하고나서, 중복되는 게 없는 경우에만 회원가입 진행
        
        // 계정 생성 
        //var account_pw = this.state.account_pw;
        let account_pw = $('#study_make_pw').val();
        web3.eth.personal.newAccount(account_pw);
        console.log('사용된 패스워드: ' + account_pw);
    
        // (예정) 생성된 계좌의 잔액은 0Ether이다. 충전하는 부분 만들어야 한다.
        // 있는 계정들 모두 출력

        // 마지막에 생성된 계정 index구하기
            var account_id =  myAccount.length - 1;
            console.log(account_id);
    
        // DB 저장 시 계정 index값과 비밀번호, hash계정 값 저장해야함.
        var account_num = myAccount[account_id];
        console.log('['+(account_id)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났고, 비밀번호는 ' + account_pw);
    
        
        // DB에 값 삽입
        this.callCreateAccountApi(this.state.person_id, account_id, account_num, account_pw).then((response) => {
            //console.log(response.data);
            console.log(this.state.person_id +' '+account_id+' '+account_num+' '+account_pw);
        }).catch((error)=>{
        console.log(error);
        });

        return account_id;
        
    
        // this.createTheStudy(0,account_num, 'person', 1, 40);
        
    }

    callCreateAccountApi = (_person_id,_account_id,_account_num,_account_pw) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_id: _account_id,
            account_num: _account_num,
            account_pw: _account_pw
        });
    }

    transferCoin(_account_id){
        const { studyGroupInstance, myAccount, web3} = this.state; 
    
        let study_make_coin = $('#study_make_coin').val();
        // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
        studyGroupInstance.methods.transferCoin(myAccount[_account_id]).send(
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
    }

    handleFormSubmit = (e) => {
        // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
        e.preventDefault(); 
        if(this.check() === true){
            this.addCustomer()
            .then((response) => {
                console.log(response.data);
                setTimeout(
                    this.addleader(response.data.insertId).then(() =>{
                        let account_id = this.createAccount();
                        this.transferCoin(account_id);
                        this.props.history.push('/mainPage'); 
                    })
                    , 100);
            })    
        } else{
            alert('모든 항목에 입력해주세요.');
        }
       
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }
    
    addCustomer = () => {
        const url = '/api/studyItems';

        return post(url,  {
            study_name: this.state.study_name,
            study_type: this.state.study_type,
            num_people:this.state.num_people,
            study_period:this.state.study_period,
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
            account_number: '11-22'
        
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

    make_tag(){
        let subjects = ['TOEIC', 'TOFEL', '토익스피킹', 'OPIC', '전산 관련 자격증', 'GTQ', '한국사능력검정시험', '기타'];
        for(let i = 0; i < subjects.length; i++){
            $("#study_make_subject").append('<option>'+subjects[i]+'</option>');
        }

        for(let i = 1; i < 25; i++){
            $("#study_make_period").append('<option>'+i+'</option>');
        }

        for(let i = 2; i < 11; i++){
            $("#study_make_total_number").append('<option>'+i+'</option>');
        }

        for(let i = 1; i < 11; i++){
            $("#study_make_coin").append('<option>'+i+'</option>');
        }
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
                            <span id="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">종류 </label>
                            <span id="dotdot">:</span>
                            <select className="form-control" id="study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 기간(주) </label>
                            <span id="dotdot">:</span>
                            <select className="form-control" id="study_make_period"  name='study_period' value={this.state.study_period} onChange={this.handleValueChange}>                         
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 모집 인원(명) </label>
                            <span id="dotdot">:</span>
                                <select className="form-control" id="study_make_total_number" name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
                                </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 가입 코인: </label>
                            <span id="dotdot">:</span>
                            <select className="form-control" id="study_make_coin" name='study_coin' value={this.state.study_coin}  onChange={this.handleValueChange}> 
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">코인지갑 비밀번호</label>
                            <span id="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_pw"/>
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