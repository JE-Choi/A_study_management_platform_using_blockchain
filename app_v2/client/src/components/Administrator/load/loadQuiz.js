import InitContract from '../../BlockChain/InitContract';
import DBControl_txn from '../../../utils/DBControl_txn';
const loadQuizCheck = {
    run : async function(studyItems){
        return new Promise(function (resolve, reject) {
            let data = [];
            let i = 0;
            let transactions_list = [];
           for(i = 0; i< studyItems.length; i++){
            let study_id= studyItems[i].s_id;
            loadQuizCheck.load(study_id).then((result)=>{
                console.log(result);
                if(transactions_list === false){
                    resolve(false);
                } else {
                    for (let j = 0; j< result.length; j++){
                        data.push(result[j]);
                        console.log(data);
                    }
                }
            });
           }
           
           let time = setInterval(()=>{
            if(i === studyItems.length){
                clearInterval(time);
                resolve(data);
            }
           }, 2000);
        });
    },
    load: async function(study_id){
        return new Promise(function (resolve, reject) {
        InitContract.QuizTransferInstance.methods.getStudyQuizTransfer(study_id).call().then(function(result) {
            let transactions_list = [];
            let transactions = result[0];
            console.log(result[0].length);
            if(result.length === 0){
                resolve(transactions_list);
            }
            for(let i = 0; i < transactions.length; i++){
                
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
                DBControl_txn.callSelectTxnInfo(transactions[i].idx_hash.substr(2)).then((res)=>{
                    if(res.data.length > 0){
                        let txn_hash = "0x"+res.data[0].txn_hash;
                        let date = new Date(transactions_web3_date+" "+transactions_web3_time);
                        transactions_list_sub.push(date, 'Quiz',transactions_web3_date, txn_hash, transactions_web3_senderId,transactions_web3_sendName,transactions_web3_receiverId, transactions_web3_receiverName, transactions_web3_coin, study_id);
                        transactions_list.push(transactions_list_sub);
                    }
                    if(transactions_list.length === length){
                        console.log(transactions_list.length , result[0].length);
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
  
export default loadQuizCheck;