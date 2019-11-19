import InitContract from '../BlockChain/InitContract';
import DBControl_txn from '../../utils/DBControl_txn';

const GetStudyEndTransfer = {
    transactions_list:[],
    run : async function(_studyId, userId){
        return new Promise(function (resolve, reject) {
            GetStudyEndTransfer.getStudyEndTransferList(_studyId, userId).then((transactions_list)=>{
                resolve(transactions_list);
            });
        });
    },

   // 스마트 계약 종료 거래 불러오기
   getStudyEndTransferList : async function(_study_id, userId){
    return new Promise(function (resolve, reject) {
        let transactions = null;
       
        InitContract.StudyEndTransferInstance.methods.getStudyEndTransferList(_study_id).call().then(function(result) {
            let transactions_list = [];
            console.log(result);
            if(result.length === 0){
                resolve(transactions_list);
            }
            for(let i = 0; i < result.length; i++){
                let cnt = i;
                transactions = result[i];
                let transactions_list_sub = [];
                let transactions_web3_personId =  InitContract.web3.utils.hexToUtf8(transactions[0]);
                if(userId !== ""){
                    if(userId === transactions_web3_personId){
                        let transactions_web3_personName =  InitContract.web3.utils.hexToUtf8(transactions[1]);
                        let transactions_web3_coin = InitContract.web3.utils.fromWei(String(transactions[2]), 'ether');
                        let transactions_web3_date = InitContract.web3.utils.hexToUtf8(transactions[3]);
                        DBControl_txn.callSelectTxnInfo(transactions.idx_hash.substr(2)).then((res)=>{
                            if(res.data.length > 0){
                                let txn_hash = '0x'+res.data[0].txn_hash;
                                if(transactions_list.length > 0){
                                    console.log(transactions_list[transactions_list.length-1][1] === txn_hash);
                                    console.log(txn_hash);
                                    if(transactions_list[transactions_list.length-1][1] !== txn_hash){
                                        transactions_list_sub.push(transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin);
                                        transactions_list.push(transactions_list_sub);
                                        console.log(transactions_list);
                                        resolve(transactions_list);
                                    }
                                } else {
                                    transactions_list_sub.push(transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin);
                                    transactions_list.push(transactions_list_sub);
                                    console.log(transactions_list);
                                    resolve(transactions_list);
                                }
                            }
                        });
                    }
                } else{
                    let transactions_web3_personName =  InitContract.web3.utils.hexToUtf8(transactions[1]);
                    let transactions_web3_coin = InitContract.web3.utils.fromWei(String(transactions[2]), 'ether');
                    let transactions_web3_date = InitContract.web3.utils.hexToUtf8(transactions[3]);
                    console.log(transactions.idx_hash);

                    DBControl_txn.callSelectTxnInfo(transactions.idx_hash.substr(2)).then((res)=>{
                        if(res.data.length > 0){
                            let txn_hash = '0x'+res.data[0].txn_hash;
                            if(transactions_list.length > 0){
                                console.log(transactions_list[transactions_list.length-1][1] === txn_hash);
                                console.log(txn_hash);
                                if(transactions_list[transactions_list.length-1][1] !== txn_hash){
                                    transactions_list_sub.push(transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin);
                                    transactions_list.push(transactions_list_sub);
                                    if(cnt === result.length-1){
                                        resolve(transactions_list);
                                    } 
                                }
                            } else {
                                transactions_list_sub.push(transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin);
                                transactions_list.push(transactions_list_sub);
                                if(cnt === result.length-1){
                                    resolve(transactions_list);
                                } 
                            }
                        }
                    });
                }
            }
        });
    });
    },
};
  
export default GetStudyEndTransfer;