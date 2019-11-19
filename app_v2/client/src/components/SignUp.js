import React, { Component } from 'react';
import './SignUp.css';
import { post } from 'axios';
import InitContract from './BlockChain/InitContract';
import ProgressBarBackGround from '../utils/ProgressBar/ProgressBarBackGround';
import $ from 'jquery';
import alert from '../utils/Alert';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            personId: '',
            personPw: '',
            personPw2: '',
            personName: '',
            etherAccountPwd:'',
            view_progressBar: false
        }
    }

componentDidMount  = () =>{
    InitContract.init().then(()=>{     
    });
}

handleFormSubmit = (e) => {
    e.preventDefault(); 
       
    //  Pw와 Pw2가 같은지 판별한 후 같은 경우만 DB에 삽입
    if(this.state.personPw === this.state.personPw2){
        this.callSignUpOverlapApi();
    } else{
        this.setState ({
            personPw: '',
            personPw2: ''
        })
        this.MismatchPwConfirm();
        }
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 회원가입할 때 PERSON_INFO에 data 삽입.
    callSignUpApi = () => {
        const url = '/api/signup';

        return post(url,  {
            personId: this.state.personId,
            personPw: this.state.personPw,
            personName:this.state.personName,
        });
    }

    // 회원 가입할 때 중복 ID 체크하는 부분
    callSignUpOverlapApi = () => {
        const url = '/api/select/person_info/where/person_id';

        post(url,  {
            person_id: this.state.personId
        })
        .then(res => {
        var check_id = res.data.length;
        
         // 중복 ID가 없는 경우 회원가입 가능
         if(check_id === 0) {
            this.setState({
                view_progressBar: true
            });
            this.callSignUpApi()
            .then((response) => {
                // 정상적으로 처리가 된 경우
                // this.SignUpConfirm();
                this.createAccount();
            })
 
        }
        // 중복 ID가 있는 경우 회원가입 불가능
        else{
            this.setState ({
                personId: '',
                personPw: '',
                personPw2: '',
                personName: '',
                etherAccountPwd:''
            })
            this.OverlapIdConfirm();
        }
      }).catch(err => console.log(err));
    }

    // 회원가입할 때 PERSON_INFO에 data 삽입.
    callCreateAccountInfoApi = (account_index, account_num, account_pw, personId) => {
        const url = '/api/insert/main_account_list';
        console.log(account_index, account_num, this.state.etherAccountPwd);
        return post(url,  {
            account_index: account_index,
            account_num: account_num,
            account_pw: account_pw,
            person_id : personId
        });
    }

    createAccount = async() =>{
        console.log('실행됨.');
        let pwdArray = [];
        let personId = this.state.personId;
        pwdArray.push(this.state.etherAccountPwd);
        console.log(this.state.etherAccountPwd);
        InitContract.createMainAccount(this.state.etherAccountPwd)
        .then((_accountsInfo)=>{
            $('.sub_msg2').text('조금만 기다려 주세요...70%');
                    let accountsInfo = _accountsInfo;
                    let account_index = accountsInfo[0].account_index;
                    let account_num = accountsInfo[1].account_num;
                    this.callCreateAccountInfoApi(account_index, account_num, pwdArray[0], personId).then(()=>{
                         setTimeout(()=>{
                            this.setState ({
                                personId: '',
                                personPw: '',
                                personPw2: '',
                                personName: '',
                                etherAccountPwd:''
                            });
                            $('.sub_msg2').text('조금만 기다려 주세요...85%');
                            this.SignUpConfirm();
                            this.setState({
                                view_progressBar: false
                            });
                            this.props.history.push('/mainPage');
                        },3000);
                    });  
        });
    } 
 
    // 비밀번호 일치하지 않는다는 안내
    MismatchPwConfirm = () => {
        alert.confirm('','비밀번호가 일치하지 않습니다.');
    }

    // 회원가입 축하 안내
    SignUpConfirm = () => {
        alert.confirm('','회원가입을 축하합니다.');
    }

    // 중복된 아이디는 회원가입 할 수 없다는 안내
    OverlapIdConfirm = () => {
        alert.confirm('중복된 아이디입니다.','회원가입을 진행할 수 없습니다.');
    }

    render() {
        return (
            <div className="pageBackgroundColor">
                <div style={{marginTop: 10}} className = "container">
                    <div className="sign_up_label">Sign Up</div>
                    <form onSubmit={this.handleFormSubmit}>
                        <div className="sign_box">
                            <div className="form-group sign_up_form">
                                <label className="input_text">아이디 </label>
                                <input type="text" className="form-control sign_up_input" name="personId" placeholder="id" value={this.state.personId} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group sign_up_form">
                                <label className="input_text">비밀번호  </label>
                                <input type="password" className="form-control sign_up_input" name="personPw" placeholder="password" value={this.state.personPw} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group sign_up_form">
                                <label className="input_text">비밀번호<br/>확인</label>
                                <input type="password" className="form-control sign_up_input" name="personPw2" placeholder="password" value={this.state.personPw2} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group sign_up_form">
                                <label className="input_text">이름 </label>
                                <input type="text" className="form-control sign_up_input" name="personName" placeholder="name" value={this.state.personName} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group sign_up_form">
                                <label className="input_text">메인 계좌<br/>비밀번호 </label>
                                <input type="password" className="form-control sign_up_input" name="etherAccountPwd" placeholder="main account password" value={this.state.etherAccountPwd} onChange={this.handleValueChange}/>
                            </div>
                            <div className="account_num_desc">
                                <div className="account_desc">- 비밀번호를 입력하시면 Ethereum 계좌가 생성됩니다. </div>
                                <div className="account_desc">- 각 스터디가 종료될 때, 이 계좌로 보증금이 반환됩니다.</div>
                            </div>
                        </div>
                        <div className="form-group sign_up_form">
                            <input type="submit" value="회원가입" className="btn btn-outline-primary btn-lg btn-block " id="submit"/>
                        </div>
                    </form>
                    {this.state.view_progressBar === true ?   <ProgressBarBackGround message = "회원가입 중입니다." sub_msg1='메인 계좌 생성 중입니다.' sub_msg2="조금만 기다려 주세요."/> :""}
                </div>
            </div>
        )
    }
}

export default SignUp;