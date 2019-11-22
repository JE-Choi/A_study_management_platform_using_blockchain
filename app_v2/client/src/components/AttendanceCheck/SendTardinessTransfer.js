import { post } from 'axios';
import NotAttendHandler from './NotAttendHandler';
import InitContract from '../BlockChain/InitContract';
import Sha256 from 'sha256';
import DBControl_txn from '../../utils/DBControl_txn';

const SendTardinessTransfer = {
    run : async function(_studyId, _attendance_date, _use_coin_value, _transaction_time){
        return new Promise(function (resolve, reject) {
            SendTardinessTransfer.set(_studyId, _attendance_date).then((_receiver_list)=>{
                //  블록체인거래 내역이 없다면 거래 진행 허용
                if(_receiver_list !== false){
                    let receiver_list = _receiver_list;
                    console.log('receiver_list: ', receiver_list);
                    
                     // 지각하지 않은 사람이 지각한 사람 한 사람당 받는 ether 값
                     let use_coin_value_total = _use_coin_value;
                     console.log(use_coin_value_total);
                     let latecomer_coin = String(use_coin_value_total / (receiver_list.length)).substring(0 , 6);
                     console.log(receiver_list);
                     console.log(receiver_list.length);
                     console.log(latecomer_coin);
                        
                     // DB에 미출석자 지각 처리
                     SendTardinessTransfer.TardinessProcessing(_studyId, receiver_list, _attendance_date, _studyId, latecomer_coin, _transaction_time).then((is_end)=>{
                        if(is_end){
                            // 거래 진행 여부 저장
                            SendTardinessTransfer.inert_status_of_tardiness(_studyId, _attendance_date, true).then(()=>{
                                resolve(true);
                            });
                        }
                    });
                }
            });
        });
    },

    // 최초 거래인지 확인하고, receiver셋팅하기.
    set : async function(_studyId, _attendance_date){
        return new Promise(function (resolve, reject) {
            //블록체인 거래 내역가 있는지 확인
            SendTardinessTransfer.statusOfTardinessTransaction(_studyId, _attendance_date).then((res)=>{
                let is_transaction = res.data.length;
                if(is_transaction === 0){
                    SendTardinessTransfer.receiver_list(_studyId, _attendance_date).then((receiver_list)=>{
                        resolve(receiver_list);
                    });
                } else{
                    resolve(false);
                }

            });
        });
    },

    // 최초 거래인지 확인
    statusOfTardinessTransaction : async function(_studyId, _attendance_date){
        const url = '/api/community/tardiness_deal_status';
            return post(url, {
                study_id: _studyId,
                transaction_date: _attendance_date
            });
    },

    // 출석자 추출
    receiver_list : async function(_studyId, _attendance_date){
        const url = '/api/community/receiver_list';
        return new Promise(function (resolve, reject) {
            post(url, {
                study_id: _studyId,
                attendance_start_date: _attendance_date
            }).then((res)=>{
                let receiver_list = res.data;
                SendTardinessTransfer.getAttendAccount(_studyId, receiver_list).then((receiver)=>{
                    if(receiver !== null){
                        resolve(receiver);
                    }
                });
                
            });
        });
    },

    // 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자
    attendance_trading_authority : async function(_studyId, transaction_date){
        const url = '/api/community/attendanceTradingAuthority';
        
        console.log(_studyId, transaction_date, sessionStorage.getItem("loginInfo"));
        return post(url, {
            study_id: _studyId,
            transaction_date: transaction_date,
            person_id: sessionStorage.getItem("loginInfo")
        });
    },

    // 거래 진행 여부 저장
    inert_status_of_tardiness : async function(_studyId, _transaction_date, tardiness_status){
        const url = '/api/community/inert_status_of_tardiness';
        return post(url, {
            study_id: _studyId,
            transaction_date: _transaction_date,
            tardiness_status: tardiness_status
        });
    },

    TardinessProcessing: async function(_studyId, receiver_list, _transaction_date, _study_id, _coin, _transaction_time){
        return new Promise(function (resolve, reject) {
            // 지각자의 계좌 index 얻어오기
            SendTardinessTransfer.getLatecomerAccount(_studyId, NotAttendHandler.notAttendInfo).then((latecomer_data)=>{
                console.log(latecomer_data);
                if(InitContract.web3 !== null) {
                    // 지각 거래 스마트 계약 함수 실행 부분 실행
                    SendTardinessTransfer.setTardinessTransfer(latecomer_data, receiver_list, _coin, _transaction_date, _study_id, _transaction_time).then((is_end)=>{
                        console.log('TardinessProcessing: ', is_end);
                        resolve(true);
                    });
                } else {
                    // 지각 거래 스마트 계약 함수 실행 부분 실행
                    SendTardinessTransfer.setTardinessTransfer(latecomer_data, receiver_list, _coin, _transaction_date, _study_id, _transaction_time).then((is_end)=>{
                        console.log('TardinessProcessing: ', is_end);
                        resolve(true);
                    });
                }
               
            });
        });
    },

    // 지각자의 계좌 정보 얻어오기
    getLatecomerAccount: async function(_studyId, latecomer_list){
        const url = '/api/community/getAccountInfo/personInfo';
        return new Promise(function (resolve, reject) {
            let latecomer_account_info_list = [];
            for(let i = 0; i < latecomer_list.length; i++){
                let latecomer_id = latecomer_list[i].person_id;
                console.log('latecomer_id: '+latecomer_id);
                
                // 지각자의 계좌 정보 얻어오기
                post(url, {
                    study_id: _studyId,
                    person_id: latecomer_id
                }).then((res)=>{
                    // account_pw,  person_id,  study_id, account_num
                    let latecomer_account_info = res.data[0];
                    latecomer_account_info_list.push(latecomer_account_info);
                    console.log(latecomer_account_info);
                    if(i === latecomer_list.length - 1){
                        resolve(latecomer_account_info_list);
                    }
                });
            }
        });
    }, 

    // 출석자의 계좌 정보 얻어오기
    getAttendAccount: async function(_studyId, receiver_list){
        const url = '/api/community/getAccountInfo/personInfo';
        return new Promise(function (resolve, reject) {
            let receiver_account_info_list = [];
            for(let i = 0; i < receiver_list.length; i++){
                let Attend_id = receiver_list[i].person_id;
                console.log('receiver_list: '+receiver_list);
                
                // 출석자의 계좌 정보 얻어오기
                post(url, {
                    study_id: _studyId,
                    person_id: Attend_id
                }).then((res)=>{
                    let receiver_account_info = res.data[0];
                    receiver_account_info_list.push(receiver_account_info);
                    
                    if(i === receiver_list.length - 1){
                        console.log(receiver_account_info_list);
                        resolve(receiver_account_info_list);
                    }
                });
            }
        });
    }, 

   // 스마트 계약 지각 거래발생
   setTardinessTransfer : async function(_latecomer_account_info_list, _receiver_account_info_list, _coin, _transaction_date, _study_id, _transaction_time){
        console.log(_latecomer_account_info_list, _receiver_account_info_list, _coin, _transaction_date, _study_id);
        
        return new Promise(function (resolve, reject) {
            let transaction_date = InitContract.web3.utils.fromAscii(_transaction_date);
            let transaction_time = InitContract.web3.utils.fromAscii(_transaction_time);
            _latecomer_account_info_list.forEach(function(late_element,i){
            let is_transaction = false;
            let senderId = InitContract.web3.utils.fromAscii(late_element.PERSON_ID); 
            let senderName = InitContract.web3.utils.fromAscii(late_element.PERSON_NAME);
            let senderAddress = late_element.account_num;
            _receiver_account_info_list.forEach(function(rec_element,j){
                let receiverNameId = InitContract.web3.utils.fromAscii(rec_element.PERSON_ID);
                let receiverName = InitContract.web3.utils.fromAscii(rec_element.PERSON_NAME);
                let receiverAddress = rec_element.account_num;
                let idx_hash = Sha256(_transaction_date+"_"+late_element.PERSON_ID+rec_element.PERSON_ID+_coin).substr(0,64);
            // sender가 receiver에세 n ether 만큼 _date일시에 보냈다는 거래 내역을 저장하는 부분
            InitContract.web3.eth.personal.unlockAccount(senderAddress, "", 0)
            .then(()=>{
                console.log(late_element.PERSON_ID+' unlock');
                InitContract.TardinessTransferInstance.methods.setTardinessTransfer(
                    senderId, senderName, receiverNameId, receiverName, InitContract.web3.utils.toWei(String(_coin)),
                    transaction_date, _study_id, receiverAddress, '0x'+idx_hash, transaction_time
                ).send(
                    { 
                        from: senderAddress,
                        value: InitContract.web3.utils.toWei(String(_coin), 'ether'),
                        gas: 0 
                    }).on('confirmation', (confirmationNumber, receipt) => {
                        console.log('거래 완료'+late_element.PERSON_ID+'>'+rec_element.PERSON_NAME);
                        DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), rec_element.account_num);
                        if(is_transaction === false){
                            is_transaction = true;
                            if(i === _latecomer_account_info_list.length - 1){
                                resolve(true);
                            }
                        }
                    });
                });
                });
            });
        });
    },
};
  
export default SendTardinessTransfer;