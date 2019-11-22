import InitContract from '../../BlockChain/InitContract';
import DBControl_txn from '../../../utils/DBControl_txn';
const loadAttendanceCheck = {
    run : async function(studyItems){
        return new Promise(function (resolve, reject) {
            let data = [];
            let i = 0;
           for(i = 0; i< studyItems.length; i++){
            let study_id= studyItems[i].s_id;
            loadAttendanceCheck.load(study_id).then((transactions_list)=>{
                if(transactions_list === false){
                    console.log(transactions_list);
                    resolve(false);
                } else {
                    if(transactions_list.length > 0){
                        for(let j = 0; j < transactions_list.length ; j++){
                            let _transactions_list = transactions_list[j];
                            data.push(_transactions_list);
                        }
                    }
                }
              });
           }
           console.log(data);
       
           let time = setInterval(()=>{
            if(i === studyItems.length){
                clearInterval(time);
                resolve(data);
            }
           }, 2000);
        });
    },
    load : async function(_study_id){
        return new Promise(function (resolve, reject) {
            let transactions = null;
    
            InitContract.TardinessTransferInstance.methods.getTardinessTransfer(_study_id).call().then(function(result) {
                let transactions_list = [];
                console.log(result[0].length);
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
                    
                    console.log(
                        transactions_web3_date, 
                        transactions_web3_senderId,
                        transactions_web3_sendName, 
                        transactions_web3_receiverId, 
                        transactions_web3_receiverName, 
                        transactions_web3_coin);
                    DBControl_txn.callSelectTxnInfo(transactions[i].idx_hash.substr(2)).then((res)=>{
                        let txn_hash = '0x'+res.data[0].txn_hash;
                        let date = new Date(transactions_web3_date+" "+transactions_web3_time);
                        transactions_list_sub.push(
                            date,
                            'AttendanceCheck',
                            transactions_web3_date, 
                            txn_hash, 
                            transactions_web3_senderId,
                            transactions_web3_sendName, 
                            transactions_web3_receiverId, 
                            transactions_web3_receiverName, 
                            transactions_web3_coin, 
                            _study_id);
                            transactions_list.push(transactions_list_sub);
                            if(turn === length-1){
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
  
export default loadAttendanceCheck;