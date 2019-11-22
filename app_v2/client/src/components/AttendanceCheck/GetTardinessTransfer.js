import InitContract from '../BlockChain/InitContract';
import DBControl_txn from '../../utils/DBControl_txn';

const GetTardinessTransfer = {
    transactions_list: [],
    run : async function(_studyId){
        return new Promise(function (resolve, reject) {
            GetTardinessTransfer.getTardinessTransfer(_studyId).then((transactions_list)=>{
                if(transactions_list !== false){
                    resolve(transactions_list);
                } else {
                    resolve(false);
                }
                
            });
        });
    },

   // 스마트 계약 지각 거래 불러오기
   getTardinessTransfer : async function(_study_id){
    return new Promise(function (resolve, reject) {
        // let transactions_list = null;
        
        let transactions = null;

        InitContract.TardinessTransferInstance.methods.getTardinessTransfer(_study_id).call().then(function(result) {
            let transactions_list = [];
            transactions = result[0];
            if( transactions.length === 0){
                resolve(transactions_list);
            }
            for(let i = 0; i < transactions.length; i++){
                let turn = i;
                let length = transactions.length;
                let transactions_list_sub = [];
                // 지각한 사람의 person_id
                let transactions_web3_senderId = InitContract.web3.utils.hexToUtf8(transactions[i].senderId);
                // 지각한 사람의 person_name
                let transactions_web3_sendName =  InitContract.web3.utils.hexToUtf8(transactions[i].sendName);
                // 받는 사람의 person_id
                let transactions_web3_receiverId =  InitContract.web3.utils.hexToUtf8(transactions[i].receiverid);
                // 받는 사람의 person_name
                let transactions_web3_receiverName =  InitContract.web3.utils.hexToUtf8(transactions[i].receiverName);
                // 지각할 때 빠져나갈 ether
                let transactions_web3_coin = InitContract.web3.utils.fromWei(String(transactions[i].coin), 'ether');
                // 지각한 날짜
                let transactions_web3_date = InitContract.web3.utils.hexToUtf8(transactions[i].date);
                let transactions_web3_time = InitContract.web3.utils.hexToUtf8(transactions[i].time);
                console.log('time: ', new Date(transactions_web3_date+" "+transactions_web3_time));
                let date = new Date(transactions_web3_date+" "+transactions_web3_time);
                DBControl_txn.callSelectTxnInfo(transactions[i].idx_hash.substr(2)).then((res)=>{
                    console.log(res.data[0].txn_hash);
                    let txn_hash = '0x'+res.data[0].txn_hash;
                    transactions_list_sub.push(
                        date,  
                        txn_hash, 
                        transactions_web3_senderId,
                        transactions_web3_sendName, 
                        transactions_web3_receiverId, 
                        transactions_web3_receiverName, 
                        transactions_web3_coin);
                        transactions_list.push(transactions_list_sub);
                        if(turn === length-1){
                            console.log(transactions_list.length , result[0].length);
                            if(transactions_list.length !== result[0].length){
                                resolve(false);
                            } else {
                                console.log(transactions_list);
                                resolve(transactions_list);
                            }
                        }
                });
            }            
        });
    });
    }
};
  
export default GetTardinessTransfer;