import { post } from 'axios';
import InitContract from '../../BlockChain/InitContract';
import DBControl_txn from '../../../utils/DBControl_txn';

const loadMainAccount = {
    // 주 계좌 정보 조회
    callCreateAccountInfoApi : async function(_person_id){
        const url = '/api/select/main_account_list/ConfirmInformation';
        return post(url,  {
            person_id : _person_id
        });
    }, 
    run : async function(personItems){
        return new Promise(function (resolve, reject) {
            let data = [];
            // let idx_data=[];
            let i = 0;
           for(i = 0; i< personItems.length; i++){
            let turn = i;
            let person_id= personItems[i].PERSON_ID;
            let length = personItems.length;
            loadMainAccount.callCreateAccountInfoApi(person_id).then((res)=>{
                
                let account_num = res.data[0].account_num;
                loadMainAccount.load(account_num).then((mainAccountTransfer)=>{
                    if(mainAccountTransfer === false){
                        resolve(false);
                    } else {
                        console.log('turn:',turn);
                        if(mainAccountTransfer.length > 0){
                            data.push(mainAccountTransfer);
                        }
                    }
                });
            });
           }
           let time = setInterval(()=>{
            if(i === personItems.length){
                clearInterval(time);
                resolve(data);
            }
           }, 2000);
        });
    },
    load: async function (_person_accountNum){
        return new Promise(function (resolve, reject) {
            // let Ascii_person_id = InitContract.web3.utils.fromAscii(_person_id);
            InitContract.MainAccountTransferInstance.methods.getMainAccountTransfer(_person_accountNum).call().then(function(result) {
                // console.log(result);
                let mainAccountTransfer = [];
                if(result.length === 0){
                    resolve(mainAccountTransfer);
                }
                if(result.length > 0){
                    for(let i = result.length-1 ; i >= 0;i--){
                        let turn = i;
                        let sub_mainAccountTransfer = [];
                        let destination =  InitContract.web3.utils.hexToUtf8(result[i][0]); // 목적지
                        let startingPoint =  InitContract.web3.utils.hexToUtf8(result[i][1]);
                       
                        let date =  InitContract.web3.utils.hexToUtf8(result[i][2]);  // 거래날짜
                        let content =  InitContract.web3.utils.hexToUtf8(result[i][3]);  // 거래 이유 
                        let etherNum = InitContract.web3.utils.fromWei(String(result[i][4]), 'ether');
                        DBControl_txn.callSelectTxnInfo(result[i][5].substr(2)).then((res)=>{
                            // console.log(res.data);
                            if(res.data.length > 0){
                                let _date = new Date(date+" 00:00:00");
                                sub_mainAccountTransfer.push(_date);
                                sub_mainAccountTransfer.push('MainAccount');
                                sub_mainAccountTransfer.push({date:date});
                                sub_mainAccountTransfer.push({txn_hash: '0x'+res.data[0].txn_hash});
                                sub_mainAccountTransfer.push({destination:destination});
                                sub_mainAccountTransfer.push({startingPoint:startingPoint});
                                sub_mainAccountTransfer.push({etherNum:etherNum});
                                sub_mainAccountTransfer.push({content:content});
                                mainAccountTransfer.push(sub_mainAccountTransfer);
                            }
                            
                            if(turn === 0){
                                if(result.length === mainAccountTransfer.length){
                                    resolve(mainAccountTransfer);
                                } else{
                                    resolve(false);
                                }
                            }
                        });
                    }
                } else {
                    resolve(mainAccountTransfer);
                }  
            });
        });
    }
};
  
export default loadMainAccount;