import InitContract from '../../BlockChain/InitContract';
import DBControl_txn from '../../../utils/DBControl_txn';

const loadStudyEnd = {
    array:[],
    run : async function(studyItems){
        return new Promise(function (resolve, reject) {
            let data = [];
            let i = 0;
            loadStudyEnd.array=[];
           for(i = 0; i< studyItems.length; i++){
            let study_id= studyItems[i].s_id;
            loadStudyEnd.load(study_id).then((transactions_list)=>{
                console.log(transactions_list);
                if(transactions_list === false){
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
           
            InitContract.StudyEndTransferInstance.methods.getStudyEndTransferList(_study_id).call().then(function(result) {
                console.log(result.length);
                let transactions_list = [];
                if(result.length === 0){
                    resolve(transactions_list);
                }
                for(let i = 0; i < result.length; i++){
                    let cnt = i;
                    transactions = result[i];
                    let transactions_list_sub = [];
                    let transactions_web3_personId =  InitContract.web3.utils.hexToUtf8(transactions[0]);
                    let transactions_web3_personName =  InitContract.web3.utils.hexToUtf8(transactions[1]);
                        let transactions_web3_coin = InitContract.web3.utils.fromWei(String(transactions[2]), 'ether');
                        let transactions_web3_date = InitContract.web3.utils.hexToUtf8(transactions[3]);
                        let transactions_web3_time = InitContract.web3.utils.hexToUtf8(transactions.time);
                        
                        DBControl_txn.callSelectTxnInfo(transactions.idx_hash.substr(2)).then((res)=>{
                            if(res.data.length > 0){
                                let txn_hash = '0x'+res.data[0].txn_hash;
                                if(transactions_list.length > 0){
                                    if(transactions_list[transactions_list.length-1][1] !== txn_hash){
                                        let date = new Date(transactions_web3_date + ' ' + transactions_web3_time);
                                        transactions_list_sub.push(date,'StudyEnd',transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin, _study_id);
                                        transactions_list.push(transactions_list_sub);
                                        if(cnt === result.length-1){
                                            console.log(transactions_list, transactions_list.length, result.length);
                                            if(transactions_list.length !== result.length){
                                                resolve(false);
                                            } else {
                                                resolve(transactions_list);
                                            }
                                           
                                        } 
                                    }
                                } else {
                                    let date = new Date(transactions_web3_date + ' ' + transactions_web3_time);
                                    transactions_list_sub.push(date, 'StudyEnd',transactions_web3_date, txn_hash, transactions_web3_personId,transactions_web3_personName, transactions_web3_coin, _study_id);
                                    transactions_list.push(transactions_list_sub);
                                    
                                    if(cnt === result.length-1){
                                        console.log(transactions_list, transactions_list.length, result.length);
                                        if(transactions_list.length !== result.length){
                                            resolve(false);
                                        } else {
                                            resolve(transactions_list);
                                        }
                                    } 
                                }
                            }
                        });
                }
            });
        });
        }
};
  
export default loadStudyEnd;