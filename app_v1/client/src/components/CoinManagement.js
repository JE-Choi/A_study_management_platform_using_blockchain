import React, { Component } from 'react';
import './CoinManagement.css';
import { post } from 'axios';
import $ from 'jquery';

// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class CoinManagement extends Component {
    render() {
        return (
            <div className="main_coinManagement">
                <div className="content_coinManagement">
                    <AboutCoin />
                </div>
            </div>
        )
    }
}

class AboutCoin extends Component{

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            userId:'',
            studyId:'',

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,

            transactionsList : null
        }
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
      
          this.getUserNameSession().then(()=>{
            this.getEnterSession().then(()=>{
                this.callLoadAccountApi(this.state.userId,this.state.studyId).then((res)=>{
                    let account_id = res.data[0].account_id;
                    $('.account_number').val(myAccount[account_id]);
                    //let account = myAccount[account_id];
                    web3.eth.getBalance(myAccount[account_id]).then(result=>{
                        let balance = web3.utils.fromWei(result, 'ether');
                        console.log('잔여 ether: '+balance);
                    });
                   
               
                });
            });
        });
          } catch (error) {
            alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
          }
    };
    componentWillMount = async () => {
        this.initContract();
    };


    componentDidMount = async () => {

        this.initContract().then(()=>{
            this.getUserNameSession().then(()=>{
                this.getEnterSession().then(()=>{
                    this.getPersonInfoOfStudy(this.state.studyId,this.state.userId);
                    
                    this.getTardinessTransfer().then(()=>{
                        this.transactionsListFiltering().then(()=>{
                            if(this.state.transactionsList.length !== 0){
                                $('.not_exist_transfer_msg').hide();
                            }
                        });
                    });
                });
            });
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

    callLoadAccountApi = (_person_id,_study_id) => {
        const url = '/api/coinManagement/loadAccount';
        return post(url,  {
            person_id: _person_id,
            study_id: _study_id
        });
    }

    // StudyGroup.sol 파일의 studyMember구조체 load
    getPersonInfoOfStudy = async (_study_id, _person_id) => {
        const { studyGroupInstance, web3} = this.state; 
        let Ascii_person_id = web3.utils.fromAscii(_person_id);
        let numOfCoins = 0;
        studyGroupInstance.methods.getPersonInfoOfStudy(_study_id, Ascii_person_id).call().then(function(result) {
            let memberAddress =  result[0];
            let person_id = web3.utils.toAscii(result[1]);
            let study_id =  result[2];
            numOfCoins = web3.utils.fromWei(String(result[3]), 'ether');
            let person_name =  web3.utils.toAscii(result[4]);
            console.log('memberAddress: ' + memberAddress);
            console.log('person_id: ' + person_id);
            console.log('study_id: ' + study_id);
            console.log('numOfCoins: ' + numOfCoins);
            console.log('person_name: ' + person_name);
            // 코인 값 SET
            $('#sum_of_coin').text(numOfCoins+'코인');
        });
    }

    // StudyGroup.sol에서 지각 거래 얻기
    getTardinessTransfer = async () => {
        const { studyGroupInstance, web3} = this.state; 
        let transactions_list = null;
        
        let transactions = null;
        await studyGroupInstance.methods.getTardinessTransfer(this.state.studyId).call().then(function(result) {
            transactions_list = [];
       
            transactions = result[0];
            // console.log(result[0][0]);
            for(let i = 0; i < transactions.length; i++){
                let transactions_list_sub = [];
        
                let transactions_web3_senderId = web3.utils.hexToUtf8(transactions[i].senderId);
                let transactions_web3_sendName =  web3.utils.hexToUtf8(transactions[i].sendName);
                let transactions_web3_receiverName =  web3.utils.hexToUtf8(transactions[i].receiverName);
                let transactions_web3_coin = web3.utils.fromWei(String(transactions[i].coin), 'ether');
                //web3.utils.hexToUtf8(transactions[i].date)
                let transactions_web3_date = web3.utils.hexToUtf8(transactions[i].date);

                transactions_list_sub.push(transactions_web3_senderId,transactions_web3_sendName,transactions_web3_receiverName, transactions_web3_coin,transactions_web3_date);
                
                transactions_list.push(transactions_list_sub);
            }
        });

        this.setState({
            transactionsList : transactions_list
        });
    }

    // 스터디 거래내역을 접속한 사용하에 맞게 필터링
    transactionsListFiltering = async () => {
        // [i][0] => serderId, [i][1] => senderName, [i][2] => receiverName, [i][3] => coin, [i][4] => date
        let transactions_list_before_filtering  = this.state.transactionsList;
        // console.log(transactions_list_before_filtering);
        // console.log(this.state.userName);
        // 접속자가 _sender인 값들을 뽑아서 저장
        let send_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let senderName = transactions_list_before_filtering[i][1];
            
            if(senderName === this.state.userName){
                transactions_list_before_filtering[i].push('sender');
                let date = new Date(transactions_list_before_filtering[i][4]+' 00:00:01');
                console.log(date);
                transactions_list_before_filtering[i].push(date);
                send_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        let receive_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let receiverName = transactions_list_before_filtering[i][2];
            
            if(receiverName === this.state.userName){
                transactions_list_before_filtering[i].push('receiver');
                let date = new Date(transactions_list_before_filtering[0][4]+' 00:00:01');
                transactions_list_before_filtering[i].push(date);
                receive_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        // 사용자가 sender인 receiver인 배열 합치기
        let transactions_list_atfer_filtering = send_coin_list.concat(receive_coin_list);
        // console.log('send_coin_list');
        // console.log(send_coin_list);
        // console.log('receive_coin_list');
        // console.log(receive_coin_list);
        
        // 날짜순으로 정렬
        transactions_list_atfer_filtering.sort((a,b) => a[6] - b[6]);
        // console.log(transactions_list_atfer_filtering);
        this.setState({
            transactionsList : transactions_list_atfer_filtering
        });
    }

    render(){
        return(
            <div className="div_coin_management">
                <div className="coin_management_header">{this.state.userName} 님의 계좌 번호</div>
                <div className="div_account_number">
                    <input type="text" className="form-control account_number" disabled/>
                </div>
              
                <div className="coin_management_content">
                    <span className="coin_status_text">잔여 코인</span>
                    <span className="btn btn-danger" id="sum_of_coin"></span> 
                </div>
                <div className="content_coin_usage">
              
                { this.state.transactionsList ? this.state.transactionsList.map(c => {
                    if(c[5] === 'sender'){
                    return (
                        <TransferSenderInfoItem sendName = {c[1]} coin = {c[3]} date = {c[4]} type = {c[5]}/>
                        )
                    } else{
                        return (
                        <TransferReceiverrInfoItem sendName = {c[1]} coin = {c[3]} date = {c[4]} type = {c[5]}/>
                    )
                    }
                  
                })
                  : ""}
                <div className = "not_exist_transfer_msg">거래 내역이 존재하지 않습니다.</div>
               
                </div>
                </div>
        );
    }
}

class TransferSenderInfoItem extends React.Component {
 
    render() {
        return (
          <div>
                <div className="div_coin_usage">
                 {/* <TransferInfoItem sendName = {c[1]} receiverName = {c[1]} coin = {c[2]} date = {c[3]}/> */}
                <span className="date_of_use">{this.props.date}</span>
                {/* <span className="desc_of_use">{this.props.sendName}의 지각 코인</span> */}
                <span className="desc_of_sender_use">지각</span>
                <span className="used_coin">-{this.props.coin}</span>
            </div>
            <div className = "coin_clear"></div>
        </div>
            
        )
    }
}

class TransferReceiverrInfoItem extends React.Component {

    render() {
        return (
          <div>
                <div className="div_coin_usage">
                 {/* <TransferInfoItem sendName = {c[1]} receiverName = {c[1]} coin = {c[2]} date = {c[3]}/> */}
                <span className="date_of_use">{this.props.date}</span>
                <span className="desc_of_receiver_use">{this.props.sendName}의 <br/>지각 코인</span>
                <span className="used_coin">+{this.props.coin}</span>
            </div>
            <div className = "coin_clear"></div>
        </div>
            
        )
    }
}


export default CoinManagement;