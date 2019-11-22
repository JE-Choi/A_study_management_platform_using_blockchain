import InitContract from '../BlockChain/InitContract';
import DBControl_txn from '../../utils/DBControl_txn';

const GetQuizTransfer = {
    transactions_list:[],
    length:0,
  // 스마트 계약 지각 거래발생
  run: async function(_study_id){
        return new Promise(function (resolve, reject) {
            GetQuizTransfer.getStudyQuizTransfer(_study_id).then((transactions_list)=>{
                if(transactions_list !== null){
                    if(transactions_list !== false){
                        resolve(transactions_list);
                    } else {
                        resolve(false);
                    }
                   
                }
            });
        });
      },

    // 스마트 계약 지각 거래발생
    getStudyQuizTransfer : async function(_study_id){
    return new Promise(function (resolve, reject) {
        
        let transactions = null;
        InitContract.QuizTransferInstance.methods.getStudyQuizTransfer(_study_id).call().then(function(result) {
            console.log(result);
            let transactions_list = [];
            transactions = result[0];
            if( transactions.length === 0){
                resolve(transactions_list);
            }
            for(let i = 0; i < transactions.length; i++){
                let turn = i;
                let length =  transactions.length;
                let transactions_list_sub = [];
                // 퀴즈 거래 sender_id
                let transactions_web3_senderId = InitContract.web3.utils.hexToUtf8(transactions[i].senderId);
                // 퀴즈 거래 sender_name
                let transactions_web3_sendName =  InitContract.web3.utils.hexToUtf8(transactions[i].sendName);
                // 받는 사람의 person_id
                let transactions_web3_receiverId =  InitContract.web3.utils.hexToUtf8(transactions[i].receiverid);
                // 퀴즈 거래 receiver_name
                let transactions_web3_receiverName =  InitContract.web3.utils.hexToUtf8(transactions[i].receiverName);
                // 거래된 ether 값
                let transactions_web3_coin = InitContract.web3.utils.fromWei(String(transactions[i].coin), 'ether');
                // 퀴즈 거래 진행 날짜
                let transactions_web3_date = InitContract.web3.utils.hexToUtf8(transactions[i].date);
                let transactions_web3_time = InitContract.web3.utils.hexToUtf8(transactions[i].time);
                let date = new Date(transactions_web3_date + ' ' +transactions_web3_time);
                console.log(turn , length-1);
                DBControl_txn.callSelectTxnInfo(transactions[i].idx_hash.substr(2)).then((res)=>{
                    if(res.data.length > 0){
                        let txn_hash = "0x"+res.data[0].txn_hash;
                        transactions_list_sub.push(date, txn_hash, transactions_web3_senderId,transactions_web3_sendName,transactions_web3_receiverId, transactions_web3_receiverName, transactions_web3_coin);
                        transactions_list.push(transactions_list_sub);
                    }
                    console.log(length,transactions_list);
                   
                    if(transactions_list.length === length){
                        console.log(transactions_list.length , result[0].length);
                        GetQuizTransfer.length = result[0].length;
                        if(transactions_list.length !== result[0].length){
                            resolve(false);
                        } else {
                            resolve(transactions_list);
                        }
                    }
                });
            }
        });
    });
    }
};
  
export default GetQuizTransfer;