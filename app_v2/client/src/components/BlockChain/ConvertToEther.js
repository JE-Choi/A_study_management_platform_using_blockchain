import InitContract from './InitContract';
import $ from 'jquery';
import Sha256 from 'sha256';
import DBControl_txn from '../../utils/DBControl_txn';
import dotenv from "dotenv";
dotenv.config();

const ConvertToEther = {
    mainAccountTransfer:[],
    // 이더로 교환해주는 함수
    // 받는 사람 계좌 정보, 거래 진행하는 사람, ether값, 용도, 보내는 사람, 스터디 id
    run : async function(account_data, person_id, etherNum, content, sender, study_id){
        console.log(account_data);
        return new Promise(function (resolve, reject){
            if(InitContract.web3 === null){
                InitContract.init().then(()=>{
                if(content === 'm_Account_charge'){
                    let account_num = account_data.account_num;
                    ConvertToEther.ConvertToEther(account_num, person_id, etherNum, content);
                  
                } else if (content === "s_start"){
                    let account_num = sender.account_num;
                    let account_pw = sender.account_pw;
                    
                    ConvertToEther.transferEther(account_data, person_id, etherNum, account_num, account_pw, study_id).then((is_end)=>{
                        if(is_end === true){
                            console.log('run완료');
                            resolve(true);
                        }
                    });
                }
            });
            } else{
                if(content === 'm_Account_charge'){
                    let account_num = account_data.account_num;
                    ConvertToEther.ConvertToEther(account_num, person_id, etherNum, content).then((is_end)=>{
                        if(is_end === true){
                            console.log('run완료');
                            resolve(true);
                        }
                    });
                } else if (content === "s_start"){
                    let account_num = sender.account_num;
                    let account_pw = sender.account_pw;
                    ConvertToEther.transferEther(account_data, person_id, etherNum, account_num, account_pw, study_id).then((is_end)=>{
                        if(is_end === true){
                            console.log('run완료');
                            resolve(true);
                        }
                    });
                }
            }
        });
    },

    // 이더로 교환해주는 메소드
    ConvertToEther : async function(accountNum, _person_id, etherNum, _content){
        let person_id = _person_id;
        console.log(person_id);
        console.log(accountNum+'로 '+etherNum+' 전송');
        console.log(accountNum);
        return new Promise(function (resolve, reject){
            $('.sub_msg2').text('조금만 기다려 주세요...30%');
            ConvertToEther.AddMsgOfConvertToEther(person_id, etherNum, _content, accountNum).then((is_end)=>{
                console.log(is_end);
                if(is_end === true){
                    resolve(true);
                }
            });
        });
    },

     // 이더로 교환해주는 메소드
     transferEther : async function(_accountNum, _person_id, _etherNum, _sender, _accountPw, _study_id){
        console.log(_accountNum, _person_id, _etherNum, _sender, _accountPw, _study_id);
        return new Promise(function (resolve, reject){
            let person_id = _person_id;
            console.log(person_id);
            console.log(_accountNum+'로 '+_etherNum+' 전송');
            console.log('sender: '+_sender, _accountPw);
            let _content = 'study_join';
            ConvertToEther.AddMsgsOfConvertToEther(_content, person_id, _etherNum, _study_id, _accountNum, _sender, _accountPw).then((is_end)=>{
                    if(is_end === true){
                        console.log('transferEther 완료');
                        resolve(true);
                }
            });
        });
    },

    AddMsgsOfConvertToEther : async function( _content, person_id, etherNum, _study_id, _accountNum, _sender, _accountPw){
        return new Promise(function (resolve, reject) {
            console.log('AddMsgsOfConvertToEther:');
            console.log('_content: ', _content);
            console.log(person_id);
            let etherToWei = InitContract.web3.utils.toWei(String(etherNum), 'ether');
            console.log('etherNum: ', etherNum);
            console.log('_study_id: ', _study_id);
            let d = new Date();
            let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let date = d.getDate();
            let Ascii_date =  InitContract.web3.utils.fromAscii(year+'.'+month+'.'+date); 
            let idx_hash = Sha256(d+"_"+person_id+"_Admin"+etherNum).substr(0,64);
            // 비밀번호(_accountPw)로 스마트 계약에 전자 서명을 진행할 계좌(_sender) unlock하기
            InitContract.web3.eth.personal.unlockAccount(_sender, _accountPw, 10000)
            .then(()=>{
                let _destination = _study_id+'#'+person_id;
                let _startingPoint = 'Main#'+person_id;
                // to.스터디 id # 사용자 id 즉, to.3#user1 
                // from.main # 사용자 id 즉, from.Main#user1
                console.log(person_id, _destination, _startingPoint, etherNum,  _content);
               
                // let Ascii_person_id =  InitContract.web3.utils.fromAscii(person_id); 
                let Ascii_destination =  InitContract.web3.utils.fromAscii(_destination); 
                let Ascii_startingPoint = 
                InitContract.web3.utils.fromAscii(_startingPoint);
                let Ascii_content = 
                InitContract.web3.utils.fromAscii(_content);

                InitContract.MainAccountTransferInstance.methods.setMainAccountTransfer(
                    _sender, Ascii_destination, Ascii_startingPoint, etherToWei, Ascii_date, Ascii_content, _accountNum, '0x'+idx_hash
                ).send(
                    {
                        from: _sender, 
                        value: InitContract.web3.utils.toWei(String(etherNum), 'ether'),
                        gas: 1000000
                    }
                ).on('confirmation', (confirmationNumber, receipt) => {
                    console.log("충전 내역 저장 완료");
                    console.log('AddMsgsOfConvertToEther 완료');
                    DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), _accountNum);
                    resolve(true);
                });
            });
        });
    },
    
    AddMsgOfConvertToEther : async function(person_id, etherNum, _content, accountNum){
        let is_end = false;
        return new Promise(function (resolve, reject) {
            let Ascii_destination =  InitContract.web3.utils.fromAscii('Main#'+person_id); 
            let Ascii_startingPoint = 
            InitContract.web3.utils.fromAscii("Admin");
            let Ascii_content = 
            InitContract.web3.utils.fromAscii(_content);
            let d = new Date();
            let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let date = d.getDate();
            let Ascii_date =  InitContract.web3.utils.fromAscii(year+'.'+month+'.'+date); 
            let etherToWei = InitContract.web3.utils.toWei(String(etherNum), 'ether');
            let idx_hash = Sha256(d+"_"+person_id+"_Admin"+etherNum).substr(0,64);
            console.log('0x'+idx_hash);
            // 스마트 계약에 전자 서명을 진행할 관리자 계좌 unlock하기
            InitContract.web3.eth.personal.unlockAccount(InitContract.myAccount[0], process.env.REACT_APP_GETH_MANAGER_PWD, 10000)
            .then(()=>{
                $('.sub_msg2').text('조금만 기다려 주세요...70%');
                InitContract.MainAccountTransferInstance.methods.setMainAccountTransfer(
                    accountNum, Ascii_destination, Ascii_startingPoint, etherToWei, Ascii_date, Ascii_content, accountNum, '0x'+idx_hash
                ).send(
                    {
                        from: InitContract.myAccount[0], // 관리자 계좌
                        value: InitContract.web3.utils.toWei(String(etherNum), 'ether'),
                        gas: 4000000
                    }
                ).on('error', function(error){ console.log(error); })
                .on('transactionHash', function(transactionHash){ console.log(transactionHash);  })
                .on('receipt', function(receipt){
                    console.log(receipt);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    if(is_end === false){
                        console.log("충전 내역 저장 완료");
                        console.log(confirmationNumber);
                        console.log("transactionHash: ",receipt.transactionHash);
                        DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), accountNum);
                        is_end = true;
                        $('.sub_msg2').text('조금만 기다려 주세요...90%');
                        resolve(true);
                    }
                });
            });
        });
    },


    
    // studyMember구조체 load
    getMainAccountTransfer: async function (_person_accountNum){
        return new Promise(function (resolve, reject) {
            // let Ascii_person_id = InitContract.web3.utils.fromAscii(_person_id);
            InitContract.MainAccountTransferInstance.methods.getMainAccountTransfer(_person_accountNum).call().then(function(result) {
                
                let mainAccountTransfer = [];
                if(result !== null){
                    if(result.length === 0){
                        resolve(mainAccountTransfer);
                    }
                    if(result.length > 0){
                        console.log(result.length);
                        console.log(result);
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
                                    sub_mainAccountTransfer.push({date:date});
                                    sub_mainAccountTransfer.push({txn_hash: '0x'+res.data[0].txn_hash});
                                    sub_mainAccountTransfer.push({destination:destination});
                                    sub_mainAccountTransfer.push({startingPoint:startingPoint});
                                    sub_mainAccountTransfer.push({etherNum:etherNum});
                                    sub_mainAccountTransfer.push({content:content});
                                    mainAccountTransfer.push(sub_mainAccountTransfer);
                                }
                                
                                if(turn === 0){
                                    if(mainAccountTransfer.length !== result.length){
                                        resolve(false);
                                    } else {
                                        resolve(mainAccountTransfer);
                                    }
                                }
                            });
                        }
                    } else {
                        resolve(mainAccountTransfer);
                    }     
                } else{
                    resolve(mainAccountTransfer);
                }
            });
        });
    }
};
  
export default ConvertToEther;