import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';
import $ from 'jquery';
import ProgressBar from '../utils/ProgressBar/ProgressBar';
import InitContract from './BlockChain/InitContract';
import CreateStudyTransaction from './BlockChain/CreateStudyTransaction';
import GetTardinessTransfer from './AttendanceCheck/GetTardinessTransfer';
import GetQuizTransfer from './AboutQuiz/GetQuizTransfer';
import GetStudyEndTransfer from './AboutStudyEnd/GetStudyEndTransfer';
import alert from '../utils/Alert';
import dotenv from "dotenv";
dotenv.config();
// import { Grow } from '@material-ui/core';

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
            account_number:'',
            sum_of_coin:'',
            is_visible: false,
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

    // 접속한 스터디가 종료된 스터디인지 확인
    callStudyIsEnd = async () => {
        const url = '/api/community/isEnd';

        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid")
        });
    }

    componentDidMount = async () => {
        if(InitContract.web3 === null){
            InitContract.init().then(()=>{
                this.getUserNameSession().then(()=>{
                    this.getEnterSession().then(()=>{
                        // 스마트 계약에서 출석체크, 퀴즈 거래 내역 불러와서 합치고, 날짜별로 정렬
                        this.transactionsListFiltering(this.state.studyId);
                    });
                });
            });
        } else{
            this.getUserNameSession().then(()=>{
                this.getEnterSession().then(()=>{
                    // 스마트 계약에서 출석체크, 퀴즈 거래 내역 불러와서 합치고, 날짜별로 정렬
                    this.transactionsListFiltering(this.state.studyId);
                });
            });
        }
    
        this.callStudyIsEnd().then((res)=>{
            console.log('is_end: ',res.data);
            // console.log(res.data);
            if(res.data.length>0){
                console.log(res.data[0].is_end);

                let is_end = res.data[0].is_end;
                this.setState({
                    is_end: is_end
                });
                // 종료되지 않은 스터디
                if(is_end === 0){
                    // Ether 관리 유의사항 modal
                    alert.confirm('','블록체인 거래 시 별도의 수수료가 발생하므로 기록된 거래 Ether 값보다 잔여 Ether가 적을 수 있습니다.');
                }
                // 종료된 스터디
                else{
                    // 스터디 종료 문구
                    alert.confirm('스터디가 종료되었습니다.','종료 거래는 [계좌 이용 내역] 화면에서 확인할 수 있습니다.');
                }
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
            let userId = sessionStorage.getItem("loginInfo");
            let studyId = sessionStorage.getItem("enterStudyid");
            console.log(userId, studyId);
            this.setState({
                studyId: studyId,
                userId: userId
            });
            CreateStudyTransaction.callSubAccountInfoApi(userId, studyId).then((account)=>{
                console.log(account.data);
                if(account.data.length > 0){
                    let account_num = account.data[0].account_num;
                    console.log(account_num, account_num.length);
                    let length = account.data[0].account_num.length;
                    let star = "*";
                    
                    for(let i = 15; i< length -1 ; i++){
                        star = star + "*";
                    }

                    let account_num_star = account_num.substr(0,15)+star;
                    console.log(account_num_star, account_num_star.length);
                    if(this.state.is_end === 0){
                        InitContract.getBalance(account_num).then((_balance)=>{
                            let balance = String(_balance).substr(0,5);
                            this.setState({
                                userId : userId, 
                                studyId : studyId,
                                account_number:account_num_star,
                                sum_of_coin: balance
                            });
                        });
                    } else {
                        this.setState({
                            userId : userId, 
                            studyId : studyId,
                            account_number:account_num_star,
                            sum_of_coin: 0
                        });
                    }
                    
                }    
            });
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

    // 퀴즈 거래 load
    getQuizInfoOfStudy = async (_study_id) => {
        return new Promise(function (resolve, reject) {
            GetQuizTransfer.run(_study_id).then((transactions_list)=>{
                console.log(transactions_list);
                resolve(transactions_list);
            })
        });
    }

     // 스터디 퀴즈 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
     quizListFiltering = async (_quizTransactionsList) => {
        // [i][0] => serderId, [i][1] => senderName, [i][2] => receiverName, [i][3] => coin, [i][4] => date
        let transactions_list_before_filtering  = _quizTransactionsList;
        console.log(_quizTransactionsList);
        // 접속자가 _sender인 값들을 뽑아서 저장
        let send_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let senderName = transactions_list_before_filtering[i][3];
            
            if(senderName === this.state.userName){
                transactions_list_before_filtering[i].push('sender');
                // let date = new Date(transactions_list_before_filtering[i][0]+' 00:00:01');
                // transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('quiz');
                send_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        let receive_coin_list = [];
        for(let i = 0; i < transactions_list_before_filtering.length; i++){
            let receiverName = transactions_list_before_filtering[i][5];
            
            if(receiverName === this.state.userName){
                transactions_list_before_filtering[i].push('receiver');
                // let date = new Date(transactions_list_before_filtering[i][0]+' 00:00:01');
                // transactions_list_before_filtering[i].push(date);
                transactions_list_before_filtering[i].push('quiz');
                receive_coin_list.push(transactions_list_before_filtering[i]);
            }
        }

        // 사용자가 sender인 receiver인 배열 합치기
        let transactions_list_atfer_filtering = send_coin_list.concat(receive_coin_list);
        console.log(transactions_list_atfer_filtering);
        for(let i = 0; i< transactions_list_atfer_filtering.length; i++){
            console.log(transactions_list_atfer_filtering[i].length, transactions_list_atfer_filtering[i], transactions_list_atfer_filtering);
            if(transactions_list_atfer_filtering[i].length){

            }
        }
        this.setState({
            quizTransactionsList : transactions_list_atfer_filtering
        });
    }

    // 지각 거래 얻기
    getTardinessTransfer = async (_studyId) => {
        return new Promise(function (resolve, reject) {
            GetTardinessTransfer.run(_studyId).then((res)=>{
                resolve(res);
            });
        });        
    }

    // 스마트 계약에 저장된 거래 내역 불러오고, 접속한 사용자가 sender인지, receiver인지 분류
    transactionsListFiltering = async (_study_id) => {
        // console.log(_study_id);
        // 스마트 계약에서 출석체크 거래 불러오기
        this.getTardinessTransfer(_study_id).then((tardinessTransactionsList)=>{
            console.log(tardinessTransactionsList);
            if(tardinessTransactionsList !== false){
                // 스터디 출석체크 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
                this.tardinessListFiltering(tardinessTransactionsList).then(()=>{
                    console.log(this.state.tardinessTransactionsList);
                    // 스마트 계약에서 퀴즈 거래 불러오기
                    this.getQuizInfoOfStudy(this.state.studyId).then((quizTransactionsList)=>{
                        console.log(quizTransactionsList);
                        console.log(GetQuizTransfer.length , quizTransactionsList.length);
                        if(quizTransactionsList !== false && GetQuizTransfer.length === quizTransactionsList.length){
                            // 스터디 퀴즈 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
                            this.quizListFiltering(quizTransactionsList).then(()=>{
                                console.log(this.state.tardinessTransactionsList);
                               this.transactionsMergeAndSort().then(()=>{
                                    this.getStudyEndTransferList(_study_id, this.state.userId).then((end_transactionsList)=>{
                                        console.log(end_transactionsList);
                                        this.setState({
                                            end_transactionsList:end_transactionsList,
                                            is_visible: true
                                        });
                                        $('.not_exist_transfer_msg').hide();
                                    });
                                });
                            });
                        } else {
                            alert.reloadConfirm("새로고침 해주세요.");
                            // this.transactionsListFiltering(_study_id);
                        }
                    });
                });
            } else {
                this.transactionsListFiltering(_study_id);
            }
        });
    }

    // 스마트 계약에서 불러온 거래 내역 병합하고, 최신 순으로 정렬
    transactionsMergeAndSort = async () => {
        let tardinessTransactionsList = this.state.tardinessTransactionsList;
        let quizTransactionsList = this.state.quizTransactionsList;
        // return new Promise(function (resolve, reject) {
            let transactions_merge =  tardinessTransactionsList.concat(quizTransactionsList);
            console.log(transactions_merge);
            if(transactions_merge.length !== 0){
                let transactions_list= transactions_merge.sort((a,b) => b[0] - a[0]);
                $('.not_exist_transfer_msg').hide();
            //     // 날짜 배열 생성
            //     let date_array = [];
            //     let date = transactions_merge[0][8];
            //     date_array.push(date);
            //     for(let i = 1; i < transactions_merge.length; i++){
            //         console.log(transactions_merge[i]);
            //         // 중복 없을 경우만 날짜 삽입
            //         let date = transactions_merge[i][8];
            //         console.log(transactions_merge[i-1]);
            //         if(transactions_merge[i-1][8].getTime() !==transactions_merge[i][8].getTime()){
            //             date_array.push(date);
            //         }
            //     }
            //     date_array.sort((a,b) => b - a);
        
            //     // 날짜를 키값으로 가지는 배열 생성
            //     let transactions_list_date_index = [];
            //     for(let i = 0; i < transactions_merge.length; i++){
                    
            //         let date = transactions_merge[i][8];
                
            //         if(transactions_list_date_index[date] === undefined){
            //             transactions_list_date_index[date]=[];
            //             transactions_list_date_index[date].push(transactions_merge[i]);
            //         } else{
            //             transactions_list_date_index[date].push(transactions_merge[i]);
            //         }
            //     }
        
            //     // 날짜별 거래 내역에 따른 최신순 정렬 (퀴즈, 지각 ...)
            //     let transactions_list = [];
            //     for(let i = 0; i < date_array.length; i++){
            //         let item = transactions_list_date_index[date_array[i]];
            //         item.sort((a,b) => b[9] - a[9]).reverse();
            //         for(let j = 0; j < item.length; j++){
            //             transactions_list.push(item[j]);
            //         }
            //     }
            //     console.log(transactions_list);
                this.setState({
                    transactionsList: transactions_list
                });
                // resolve(transactions_list);
            }
        // });
    }

    // 스터디 출석체크 거래내역을 접속한 사용자가 sender인지, receiver인지 분류
    tardinessListFiltering = async (transactions_list_before_filtering) => {
        // [i][0] => serderId, [i][1] => senderName, [i][2] => receiverName, [i][3] => coin, [i][4] => date
        // let transactions_list_before_filtering  = _tardinessTransactionsList;
        if(transactions_list_before_filtering.length > 0){
            // 접속자가 _sender인 값들을 뽑아서 저장
            let send_coin_list = [];
            for(let i = 0; i < transactions_list_before_filtering.length; i++){
                let senderName = transactions_list_before_filtering[i][3];
                
                if(senderName === this.state.userName){
                    transactions_list_before_filtering[i].push('sender');
                    // let date = new Date(transactions_list_before_filtering[i][0]+' 00:00:01');
                    // console.log(date);
                    // transactions_list_before_filtering[i].push(date);
                    transactions_list_before_filtering[i].push('attendance');
                    send_coin_list.push(transactions_list_before_filtering[i]);
                }
            }

            let receive_coin_list = [];
            for(let i = 0; i < transactions_list_before_filtering.length; i++){
                let receiverName = transactions_list_before_filtering[i][5];
                
                if(receiverName === this.state.userName){
                    transactions_list_before_filtering[i].push('receiver');
                    // let date = new Date(transactions_list_before_filtering[i][0]+' 00:00:01');
                    // transactions_list_before_filtering[i].push(date);
                    transactions_list_before_filtering[i].push('attendance');
                    receive_coin_list.push(transactions_list_before_filtering[i]);
                }
            }
            // 사용자가 sender인 receiver인 배열 합치기
            let transactions_list_atfer_filtering = send_coin_list.concat(receive_coin_list);
            console.log(transactions_list_atfer_filtering);
            this.setState({
                tardinessTransactionsList : transactions_list_atfer_filtering
            });
        } else {
            this.setState({
                tardinessTransactionsList : []
            });
        }
        
    }

     // (스터디 별 )지정한 스터디의 종료 내역
     getStudyEndTransferList = async(_studyId, _userId)=>{
        return new Promise(function (resolve, reject) {
            GetStudyEndTransfer.run(_studyId, _userId).then((transactions_list)=>{
                resolve(transactions_list);
            });
        });
    }

    render(){
        console.log(this.state.is_visible);
        return(
            <div className="div_coin_management">
                {InitContract.web3 && this.state.is_visible === true? 
                <div>
                    <div className="coin_management_header">
                        <div className="div_account">{this.state.userName} 님의 계좌 번호</div>
                        <div className = "div_account_number">{this.state.account_number}</div>
                    </div>
                    <div className="coin_management_content">
                        <span className="coin_status_text">잔여 Ether</span>
                        <span className="btn btn-primary" id="sum_of_coin">{this.state.sum_of_coin}ETH</span> 
                    </div>
                    <div className="content_coin_usage">
                        {/* 종료 트랜잭션*/}
                        {this.state.end_transactionsList ? this.state.end_transactionsList.map(c=>{
                                return(
                                    <TransferEndItem endDate = {c[0]} txn_hash = {c[1]} ether = {c[4]}/>
                                )
                                
                            })
                            :""}
                        {/* 지각, 퀴즈 트랜잭션 */}
                        { this.state.transactionsList ? this.state.transactionsList.map(c => {
                            let _date = c[0].getFullYear()+'-'+(c[0].getMonth()+1)+'-'+c[0].getDate();
                            if(c[8] === 'attendance'){
                            return (
                                <AttendanceTransferInfoItem date = {_date} txn_hash = {c[1]} senderName = {c[3]} receiverName = {c[5]} coin = {c[6]} role = {c[7]}/>
                                )
                            } else{
                                return (
                                <QuizTransferInfoItem date = {_date} txn_hash = {c[1]} senderName = {c[3]} receiverName = {c[5]}  coin = {c[6]}  role = {c[7]}/>
                            )
                            }
                        
                        })
                        : ""}
                        <div className = "not_exist_transfer_msg">거래 내역이 존재하지 않습니다.</div>
                    </div>
                    <div className="coin_return_message">
                            ★잔여 Ether는 종료 날짜의 다음 날 또는<br className="return_msg_br"/>총 스터디 횟수가 충족되면 반환됩니다.★
                        <div className="c_explorer_div">
                            [거래 해시 복사 후, 
                                <a href = {process.env.REACT_APP_SERVER_IP} target="blank">Block Explorer</a>
                            에서 거래 검색 가능]
                        </div>
                    </div>
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
                {this.props.role === 'sender'? 
                <span>
                    <span className="desc_of_transfer">지각<br/>(To. {this.props.receiverName})</span>
                    <span className="used_coin">-{Number(this.props.coin).toFixed(2)} ETH</span>
                </span>
                :
                <span>
                    <span className="desc_of_transfer">지각<br/>(From. {this.props.senderName})</span>
                    <span className="used_coin">+{Number(this.props.coin).toFixed(2)} ETH</span>
                </span>
                }
                <div className="txn_hash_div">
                    <div className="txn_hash_lab">거래 해시:</div> 
                    <div className="txn_hash">{this.props.txn_hash}</div>
                </div>
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
                {this.props.role === 'sender'? 
                 <span>
                    <span className="desc_of_transfer">퀴즈<br/>(To. {this.props.receiverName})</span>
                    <span className="used_coin">-{Number(this.props.coin).toFixed(2)} ETH</span>
                 </span>
                :
                <span>
                    <span className="desc_of_transfer">퀴즈<br/>(From. {this.props.senderName})</span>
                    <span className="used_coin">+{Number(this.props.coin).toFixed(2)} ETH</span>
                </span>
                }
                <div className="txn_hash_div">
                    <div className="txn_hash_lab">거래 해시: </div>
                    <div className="txn_hash">{this.props.txn_hash}</div>
                </div>
            </div>
            <div className = "coin_clear"></div>
        </div>
            
        )
    }
}

class TransferEndItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            endDate:''
        }
    }

    componentDidMount = () =>{
        let endDate = this.props.endDate.split('.');
        let str_endDate = endDate[0] +'-'+ endDate[1] + '-' +endDate[2];
        this.setState({
            endDate: str_endDate
        });
    }
    render() {
        return (
          <div>
                <div className="div_coin_usage">
                <span className="date_of_use">{this.state.endDate}</span>
                <span className="desc_of_end_transfer">종료</span>
                <span className="used_coin">-{Number(this.props.ether).toFixed(2)} ETH</span>
                <div className="txn_hash_div">
                    <div className="txn_hash_lab">거래 해시: </div>
                    <div className="txn_hash">{this.props.txn_hash}</div>
                </div>
            </div>
            <div className = "coin_clear"></div>
        </div>
        )
    }
}

export default CoinManagement;