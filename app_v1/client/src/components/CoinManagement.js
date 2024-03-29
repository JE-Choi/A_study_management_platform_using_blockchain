import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';
import $ from 'jquery';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';
import ProgressBar from '../utils/ProgressBar';
// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class CoinManagement extends Component {
    render() {
        return (
            <div className="pageBackgroundColor">
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
            is_end: null,
            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            tardinessTransactionsList : null,
            end_transactionsList: null,
            quizTransactionsList: null,
            transactionsList: null
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
            console.log(web3);
          //   Set web3, accounts, and contract to the state, and then proceed with an
          //   example of interacting with the contract's methods.
          this.setState({ web3, myAccount, studyGroupInstance: instance});
      
          this.getUserNameSession().then(()=>{
            this.getEnterSession().then(()=>{
                this.callLoadAccountApi(this.state.userId,this.state.studyId).then((res)=>{
                    console.log(res.data);
                    if(res.data.length !== 0){
                        let account_index = res.data[0].account_index;
                        $('.account_number').val(myAccount[account_index]);
                        web3.eth.getBalance(myAccount[account_index]).then(result=>{
                            let balance = web3.utils.fromWei(result, 'ether');
                            // 코인 값 SET
                            let coin = String(balance*10).substring(0 , 6);
                            if(this.state.is_end === 1){
                                coin = Math.floor(coin);
                            }
                            $('#sum_of_coin').text(coin+'코인');
                            console.log('잔여 ether: '+balance);
                        });
                    }
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

     // 코인 관리 유의사항 modal
     cautionConfirm = () => {
        confirmAlert({
           message: '블록체인 거래 시 별도의 수수료가 발생하므로 기록된 거래 코인 값보다 잔여 코인이 적을 수 있습니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 스터디 종료 문구
    studyEndConfirm = () => {
        confirmAlert({
            title: '스터디가 종료되었습니다.',
            message: '종료 거래는 거래 내역에서 확인하실 수 있습니다.',
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

    componentDidMount = async () => {
        this.initContract().then(()=>{
            this.getUserNameSession().then(()=>{
                this.getEnterSession().then(()=>{
                    this.getPersonInfoOfStudy(this.state.studyId,this.state.userId);
                    // 스마트 계약에서 출석체크, 퀴즈 거래 내역 불러와서 합치고, 날짜별로 정렬
                    this.transactionsListFiltering();
                    // 스마트 계약에서 종료 거래 불러오기
                    this.getStudyEndTransferList(this.state.studyId);
                });
            });
        });
        
        this.callStudyIsEnd().then((res)=>{
            console.log('is_end: ');
            console.log(res.data);
            console.log(res.data[0].is_end);

            let is_end = res.data[0].is_end;
            
            this.setState({
                is_end: is_end
            });
            
            // 종료되지 않은 스터디
            if(is_end === 0){
                this.cautionConfirm();
            }
            // 종료된 스터디
            else{
                this.studyEndConfirm();
            }
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

    // 특정 스터디, 특정 사용자에게 할당된 계좌 인덱스
    callLoadAccountApi = (_person_id,_study_id) => {
        const url = '/api/community/loadAccountIndex';
        return post(url,  {
            person_id: _person_id,
            study_id: _study_id
        });
    }

    // StudyGroup.sol 파일의 studyMember구조체 load
    getPersonInfoOfStudy = async (_study_id, _person_id) => {
        const { studyGroupInstance, web3} = this.state; 
        let Ascii_person_id = web3.utils.fromAscii(_person_id);
        studyGroupInstance.methods.getPersonInfoOfStudy(_study_id, Ascii_person_id).call().then(function(result) {
            let memberAddress =  result[0];
            let person_id = web3.utils.toAscii(result[1]);
            let study_id =  result[2];
            let person_name =  web3.utils.toAscii(result[3]);
            console.log('memberAddress: ' + memberAddress);
            console.log('person_id: ' + person_id);
            console.log('study_id: ' + study_id);
            console.log('person_name: ' + person_name);
        });
    }

    // StudyGroup.sol 파일의 퀴즈 거래 load
    getQuizInfoOfStudy = async (_study_id) => {
        const { studyGroupInstance, web3} = this.state;
        let transactions_list = null;
        
        let transactions = null;
        await studyGroupInstance.methods.getStudyQuizTransfer(_study_id).call().then(function(result) {
            transactions_list = [];
       
            transactions = result[0];
            for(let i = 0; i < transactions.length; i++){
                let transactions_list_sub = [];
        
                let transactions_web3_senderId = web3.utils.hexToUtf8(transactions[i].senderId);
                let transactions_web3_sendName =  web3.utils.hexToUtf8(transactions[i].sendName);
                let transactions_web3_receiverName =  web3.utils.hexToUtf8(transactions[i].receiverName);
                let transactions_web3_coin = web3.utils.fromWei(String(transactions[i].coin), 'ether');
                let transactions_web3_date = web3.utils.hexToUtf8(transactions[i].date);

                transactions_list_sub.push(transactions_web3_senderId,transactions_web3_sendName,transactions_web3_receiverName, transactions_web3_coin,transactions_web3_date);
                
                transactions_list.push(transactions_list_sub);
            }
        });
        this.setState({
            quizTransactionsList : transactions_list
        });
    }

     // 스터디 퀴즈 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
     quizListFiltering = async () => {
        // [i][0] => serderId, [i][1] => senderName, [i][2] => receiverName, [i][3] => coin, [i][4] => date
        let transactions_list_before_filtering  = this.state.quizTransactionsList;
        // 접속자가 _sender인 값들을 뽑아서 저장
        let send_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let senderName = transactions_list_before_filtering[i][1];
            
            if(senderName === this.state.userName){
                transactions_list_before_filtering[i].push('sender');
                let date = new Date(transactions_list_before_filtering[i][4]+' 00:00:01');
                console.log(date);
                transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('quiz');
                send_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        let receive_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let receiverName = transactions_list_before_filtering[i][2];
            
            if(receiverName === this.state.userName){
                transactions_list_before_filtering[i].push('receiver');
                let date = new Date(transactions_list_before_filtering[i][4]+' 00:00:01');
                transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('quiz');
                receive_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        // 사용자가 sender인 receiver인 배열 합치기
        let transactions_list_atfer_filtering = send_coin_list.concat(receive_coin_list);
        
        this.setState({
            quizTransactionsList : transactions_list_atfer_filtering
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
            for(let i = 0; i < transactions.length; i++){
                let transactions_list_sub = [];
        
                let transactions_web3_senderId = web3.utils.hexToUtf8(transactions[i].senderId);
                let transactions_web3_sendName =  web3.utils.hexToUtf8(transactions[i].sendName);
                let transactions_web3_receiverName =  web3.utils.hexToUtf8(transactions[i].receiverName);
                let transactions_web3_coin = web3.utils.fromWei(String(transactions[i].coin), 'ether');
                let transactions_web3_date = web3.utils.hexToUtf8(transactions[i].date);

                transactions_list_sub.push(transactions_web3_senderId,transactions_web3_sendName,transactions_web3_receiverName, transactions_web3_coin,transactions_web3_date);
                
                transactions_list.push(transactions_list_sub);
            }
        });

        this.setState({
            tardinessTransactionsList : transactions_list
        });
    }

    // 스마트 계약에 저장된 거래 내역 불러오고, 접속한 사용자가 sender인지, receiver인지 분류
    transactionsListFiltering = async () => {
        // 스마트 계약에서 출석체크 거래 불러오기
        this.getTardinessTransfer().then(()=>{
            // 스터디 출석체크 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
            this.tardinessListFiltering().then(()=>{
                // 스마트 계약에서 퀴즈 거래 불러오기
                this.getQuizInfoOfStudy(this.state.studyId).then(()=>{
                    // 스터디 퀴즈 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
                    this.quizListFiltering().then(()=>{
                        this.transactionsMergeAndSort();
                    });
                });
            });
           
        });

    }

    // 스마트 계약에서 불러온 거래 내역 병합하고, 최신 순으로 정렬
    transactionsMergeAndSort = async () => {
        let tardinessTransactionsList = this.state.tardinessTransactionsList;
        let quizTransactionsList = this.state.quizTransactionsList;
        let transactions_merge =  tardinessTransactionsList.concat(quizTransactionsList);
        if(transactions_merge.length !== 0){
            transactions_merge.sort((a,b) => b[6] - a[6]);
            console.log(transactions_merge);
         
            // 날짜 배열 생성
            let date_array = [];
            let date = transactions_merge[0][6];
            date_array.push(date);
            for(let i = 1; i < transactions_merge.length; i++){
                // 중복 없을 경우만 날짜 삽입
                let date = transactions_merge[i][6];
                if(transactions_merge[i-1][6].getTime() !==transactions_merge[i][6].getTime()){
                    date_array.push(date);
                }
            }
            date_array.sort((a,b) => b - a);
    
            // 날짜를 키값으로 가지는 배열 생성
            let transactions_list_date_index = [];
            for(let i = 0; i < transactions_merge.length; i++){
                
                let date = transactions_merge[i][6];
               
                if(transactions_list_date_index[date] === undefined){
                    transactions_list_date_index[date]=[];
                    transactions_list_date_index[date].push(transactions_merge[i]);
                } else{
                    transactions_list_date_index[date].push(transactions_merge[i]);
                }
            }
            console.log(transactions_list_date_index);
    
            // 날짜별 거래 내역에 따른 최신순 정렬 (퀴즈, 지각 ...)
            let transactions_list = [];
            for(let i = 0; i < date_array.length; i++){
                let item = transactions_list_date_index[date_array[i]];
                item.sort((a,b) => b[7] - a[7]).reverse();
                for(let j = 0; j < item.length; j++){
                    
                    transactions_list.push(item[j]);
                }
            }
            if(transactions_list.length !== 0){
                $('.not_exist_transfer_msg').hide();
            }
            console.log(transactions_list);
            this.setState({transactionsList : transactions_list});
        }
    }

    // 스터디 출석체크 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
    tardinessListFiltering = async () => {
        // [i][0] => serderId, [i][1] => senderName, [i][2] => receiverName, [i][3] => coin, [i][4] => date
        let transactions_list_before_filtering  = this.state.tardinessTransactionsList;
        // 접속자가 _sender인 값들을 뽑아서 저장
        let send_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let senderName = transactions_list_before_filtering[i][1];
            
            if(senderName === this.state.userName){
                transactions_list_before_filtering[i].push('sender');
                let date = new Date(transactions_list_before_filtering[i][4]+' 00:00:01');
                console.log(date);
                transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('attendance');
                send_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        let receive_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let receiverName = transactions_list_before_filtering[i][2];
            
            if(receiverName === this.state.userName){
                transactions_list_before_filtering[i].push('receiver');
                let date = new Date(transactions_list_before_filtering[i][4]+' 00:00:01');
                transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('attendance');
                receive_coin_list.push(transactions_list_before_filtering[i]);
            }
        }
        // 사용자가 sender인 receiver인 배열 합치기
        let transactions_list_atfer_filtering = send_coin_list.concat(receive_coin_list);
        
        this.setState({
            tardinessTransactionsList : transactions_list_atfer_filtering
        });
    }

     // (스터디 별 )지정한 스터디의 종료 내역
     getStudyEndTransferList = async(_studyId)=>{
        const { web3, studyGroupInstance} = this.state; 
        let transactions_list = null;
        
        let transactions = null;
        await studyGroupInstance.methods.getStudyEndTransferList(_studyId).call().then(function(result) {
            
            if(result.length !== 0 ){
                transactions_list = [];
    
                for(let i = 0; i < result.length ; i++){
                    let transactions_list_sub = [];
                    // let studyId = String(transactions[i].studyId);// 반환받아야 하는 스터디 id
                    let personId = web3.utils.hexToUtf8(result[i].personId); // 반환받아야 하는 사람
                    // let personName = web3.utils.hexToUtf8(result[i].personName); // 반환받아야 하는 사람 이름
                    let receiveEther = web3.utils.fromWei(String(result[i].receiveEther), "ether" ); // 반환받아야 하는 사람 ether값
                    let endDate = web3.utils.hexToUtf8(result[i].endDate); // 반환 요청된 날짜
                    receiveEther = String(receiveEther).substring(0,6);
                    
                    if(sessionStorage.getItem("loginInfo") === personId){
                        transactions_list_sub.push(endDate, receiveEther);
                        transactions_list.push(transactions_list_sub);
                    }
                }
                $('.not_exist_transfer_msg').hide();
            }
        });
        this.setState({
            end_transactionsList : transactions_list
        });
    }

    render(){
        return(
            <div className="div_coin_management">
                {this.state.web3 ? 
                <div>
                    <div className="coin_management_header">{this.state.userName} 님의 계좌 번호</div>
                    <div className="div_account_number">
                        <input type="text" className="form-control account_number" disabled/>
                    </div>
                
                    <div className="coin_management_content">
                        <span className="coin_status_text">잔여 코인</span>
                        <span className="btn btn-danger" id="sum_of_coin"></span> 
                    </div>
                    <div className="content_coin_usage">
                
                    {/* 종료 트랜잭션*/}
                    {this.state.end_transactionsList ? this.state.end_transactionsList.map(c=>{
                            return(
                                <TransferEndItem endDate = {c[0]} ether = {c[1]}/>
                            )
                            
                        })
                        :""}
                    {/* 지각, 퀴즈 트랜잭션 */}
                    { this.state.transactionsList ? this.state.transactionsList.map(c => {
                        if(c[7] === 'attendance'){
                        return (
                            <AttendanceTransferInfoItem senderName = {c[1]} receiverName = {c[2]} coin = {c[3]} date = {c[4]} role = {c[5]}/>
                            )
                        } else{
                            return (
                            <QuizTransferInfoItem senderName = {c[1]} receiverName = {c[2]}  coin = {c[3]} date = {c[4]} role = {c[5]}/>
                        )
                        }
                    
                    })
                    : ""}
                    <div className = "not_exist_transfer_msg">거래 내역이 존재하지 않습니다.</div>
                    
                    </div>
                    <div className="coin_return_message">★잔여 코인 반환은 지정된 종료 날짜의 자정에 반환됩니다.★</div>
                   
                </div>
                :<ProgressBar message ='로딩중'/>}
                </div>
        );
    }
}

class AttendanceTransferInfoItem extends React.Component {
 
    render() {
        return (
          <div>
                <div className="div_coin_usage">
                <span className="date_of_use">{this.props.date}</span>
                {this.props.role == 'sender'? 
                <span className="desc_of_transfer">지각 코인<br/>(To. {this.props.receiverName})</span>
                :
                <span className="desc_of_transfer">지각 코인<br/>(From. {this.props.senderName})</span>
                }
                <span className="used_coin">-{this.props.coin}</span>
            </div>
            <div className = "coin_clear"></div>
        </div>
            
        )
    }
}

class QuizTransferInfoItem extends React.Component {
 
    render() {
        return (
          <div>
                <div className="div_coin_usage">
                <span className="date_of_use">{this.props.date}</span>
                {this.props.role == 'sender'? 
                <span className="desc_of_transfer">퀴즈 코인<br/>(To. {this.props.receiverName})</span>
                :
                <span className="desc_of_transfer">퀴즈 코인<br/>(From. {this.props.senderName})</span>
                }
                
                <span className="used_coin">-{this.props.coin}</span>
            </div>
            <div className = "coin_clear"></div>
        </div>
            
        )
    }
}
class TransferEndItem extends React.Component {
 
    render() {
        return (
          <div>
                <div className="div_coin_usage">
                <span className="date_of_use">{this.props.endDate}</span>
                <span className="desc_of_sender_use">종료</span>
                <span className="used_coin">-{this.props.ether}</span>
            </div>
            <div className = "coin_clear"></div>
        </div>
        )
    }
}

export default CoinManagement;