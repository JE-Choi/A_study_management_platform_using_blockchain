import React, { Component } from 'react';
import etherIcon from './etherIcon.png';
import Modal from '../../utils/Modal';
import { post } from 'axios';
import ConvertToEther from '../BlockChain/ConvertToEther';
import InitContract from '../BlockChain/InitContract';
import AccountInfoContentItem from './AccountInfoContentItem';
import Alert from '../../utils/Alert';
import ProgressBarBackGround from '../../utils/ProgressBar/ProgressBarBackGround';
import dotenv from "dotenv";
dotenv.config();

class AccountInfoContent extends Component {
  state = {
    is_displayModal: false,
    person_id: '',
    person_name: '',
    accountInfo_title_accountNum:'',
    balance: '',
    mainAccountTransfer: null,
    account_index:'',
    account_data:'',
    view_progressBar: false
  };

  componentDidMount = () =>{
    let person_id = sessionStorage.getItem("loginInfo");
    let person_name = sessionStorage.getItem("loginInfo_userName");
    
    this.callCreateAccountInfoApi().then((ConfirmInformation)=>{
      let Confirm =  ConfirmInformation.data.length;
      
      if(Confirm === 1){
        let account_num = ConfirmInformation.data[0].account_num;
        this.setState({
          person_id:person_id,
          person_name: person_name,
          accountInfo_title_accountNum:account_num,
          account_data: ConfirmInformation.data[0]
        });
           // 본 계좌 거래 내역 불러오기
    let time_m = setInterval(()=>{
      if(InitContract.web3 !== null){
        clearInterval(time_m);
        this.getMainAccountTransfer(account_num);
      }
    },1000);
    this.getBalance(account_num);
      }
    });
  }

  getMainAccountTransfer = async (account_num) =>{
    ConvertToEther.getMainAccountTransfer(account_num).then((mainAccountTransfer)=>{
      if(mainAccountTransfer !== false){
        this.setState({
          mainAccountTransfer: mainAccountTransfer
        });
      } else {
        this.getMainAccountTransfer(account_num);
      }
      console.log(mainAccountTransfer);
    });
  }

  getBalance = async (account_num) =>{
    InitContract.getBalance(account_num).then((_balance)=>{
      if(_balance !== ""){
        console.log('_balance: ',_balance);
        let balance = String(_balance).substr(0,5);
        this.setState({
          balance:balance
        });
      } else {
        this.getBalance(account_num);
      }
      
    });
  }

  // 주 계좌 정보 조회
  callCreateAccountInfoApi = async() => {
    const url = '/api/select/main_account_list/ConfirmInformation';
    let person_id = sessionStorage.getItem("loginInfo");
    return post(url,  {
        person_id : person_id
    });
  }
    
  chargeAlert = () =>{
    this.setState({
      is_displayModal: true
    });
  }

  displayModal = (display, convert_to_ether_num) =>{
    this.setState({
      is_displayModal: display
    });
    if(convert_to_ether_num !== undefined){
      console.log('displayModal', this.state.person_id);
      this.setState({
        view_progressBar: true
      });
      ConvertToEther.run(this.state.account_data, this.state.person_id, convert_to_ether_num,'m_Account_charge', '', '').then((is_end)=>{
        console.log(is_end);
        if(is_end === true){
          this.setState({
            view_progressBar: false
          });
          Alert.reloadConfirm('','충전을 완료했습니다.');
        }
      });
    }
  }

  render() {
    console.log('person_id: ',this.state.person_id,' accountInfo_title_accountNum: ',this.state.accountInfo_title_accountNum);
    console.log('balance', this.state.balance, ' mainAccountTransfer: ',this.state.mainAccountTransfer);
    return (
      <div className = "accountInfoContent_SubContainer">
        {(this.state.person_id !== '')&&(this.state.accountInfo_title_accountNum !== '')
            &&(this.state.balance !== '')&&(this.state.mainAccountTransfer!== null)?
          <React.Fragment>
            <div className = "accountInfo_title">
              <div className = "accountInfo_title_name">{this.state.person_name} 님의 계좌 번호</div>
              <div className = "accountInfo_title_accountNum">{this.state.accountInfo_title_accountNum}</div>
            </div>
            <div className = "accountInfoContent_SubContainer_left">
              <div className = "accountInfo_ether">
                <div className="m_b_explorer_div">
                [거래 해시 복사 후, <a href = {process.env.REACT_APP_SERVER_IP} target="blank">Block Explorer</a>에서 거래 검색 가능]</div>
                <div>
                  <img src = {etherIcon} className ="etherIcon"/>
                </div>
                <span>{this.state.balance}  ETH</span>
                <div className = "account_charge_div_mobile">
                  <button type="button" className="btn btn-secondary btn-lg btn-block " id="btn_charge" onClick = {this.chargeAlert}>충전</button>
                  <div className = "account_charge_div">History</div>
                </div>
              </div>
              <div className="b_explorer_div">
                거래를 확인하려면 각 '거래해시'를 복사 후 <br/>
                <a href = {process.env.REACT_APP_SERVER_IP} target="blank">Block Explorer</a>에서 검색해주세요.
              </div>
            </div>
            <div className = "accountInfoContent_SubContainer_right">
              <div className = "account_charge_div_pc">
                <span className = "account_charge_span">History</span>
                <button type="button" className="btn btn-secondary btn-lg btn-block " id="btn_charge" onClick = {this.chargeAlert}>충전</button>
              </div>
              <div className = "account_history">
              { this.state.mainAccountTransfer ? this.state.mainAccountTransfer.map(c => {
                return (
                  <AccountInfoContentItem date = {c[0].date} txn_hash = {c[1].txn_hash} destination = {c[2].destination} startingPoint = {c[3].startingPoint} etherNum = {c[4].etherNum}  content = {c[5].content} person_name = {this.state.person_name}/>
                )
                })
              :""}
              </div>
            </div>
          </React.Fragment>
        : 
        <ProgressBarBackGround message ='계좌 정보 가져오는 중...' sub_msg1 = "잠시만 기다려주세요."/> 
        }    
          {
            this.state.is_displayModal === true ? 
            <Modal title = "Ether 충 전" displayModal = {this.displayModal}/>
            :""
          } 
          {this.state.view_progressBar === true ?  <ProgressBarBackGround message = "충전 중입니다."/> :""}
         
      </div>
    );
  }
}

export default AccountInfoContent;
