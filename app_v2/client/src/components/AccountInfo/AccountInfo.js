import React, { Component } from 'react';
import './styles.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';

class AccountInfo extends Component {
  state = {
    account_pw:''
  };

  handleValueChange = (e) => {
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }

  handleFormSubmit = (e) =>{
    e.preventDefault();
    this.callCreateAccountInfoApi().then((ConfirmInformation)=>{
      let Confirm =  ConfirmInformation.data.length;
      
      // personId와 비밀번호가 일치하는 경우
      if(Confirm === 1){
        
        let account_pw = ConfirmInformation.data[0].account_pw;
        let input_account_pw = this.state.account_pw;
        if(account_pw === input_account_pw){
          this.props.history.push('/accountInfo/content');
          window.location.reload();
        }
        else{
          this.inputConfirm();
        }
      }
    });
  }
  
  inputConfirm = () => {
    confirmAlert({
        message: '비밀번호가 일치하지 않습니다.',
        buttons: [
        {
            label: '확인'
        }
      ]
    })
  }

  // 회원 정보와 계좌 비밀번호 일치한지 확인
  callCreateAccountInfoApi = async() => {
    const url = '/api/select/main_account_list/ConfirmInformation';

    let person_id = sessionStorage.getItem("loginInfo");
    return post(url,  {
        person_id : person_id
    });
  }

  render() {
    return (
        <div className = "accountInfo_SubContainer">
          <div className = "accountInfo_msgbox">
            개인 정보 보호를 위해 한 번 더 본인 인증을 거칩니다.
            <br className="account_desc_br" /> 계좌 비밀번호를 입력해주세요.
          </div>
          <form className="form"  onSubmit={this.handleFormSubmit}>
            <input type="password" className="form-control" id="accountInfo_account_pw" name='account_pw' value={this.state.account_pw} onChange={this.handleValueChange} />
            <button type="submit" className="btn btn-outline-primary btn-lg btn-block " id="btn_input_account_pw">입력</button>
          </form>
        </div>
    );
  }
}

export default AccountInfo;
