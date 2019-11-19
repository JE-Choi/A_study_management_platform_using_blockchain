import { post } from 'axios';
import InitContract from '../BlockChain/InitContract';
import $ from 'jquery';
import alert from '../../utils/Alert';
import Sha256 from 'sha256';
import DBControl_txn from '../../utils/DBControl_txn';
import dotenv from "dotenv";
dotenv.config();

const SetStudyEndTransfer = {
    run: async function (_study_id){
        this.callDBStudyItemInfo(_study_id).then((_studyData)=>{
            let studyData = _studyData;
            this.callDBStudyJoinInfo(_study_id).then((_personData)=>{
                let personData= _personData;
                console.log({'studyData':studyData}, {'personData':personData});
                SetStudyEndTransfer.startTransaction(studyData, personData).then((is_end)=>{
                    if(is_end === true){
                        let nowDate = new Date();
                        console.log('startTransaction 완료: '+nowDate);
                        $('.progress_layer').hide();
                        alert.confirm('종료체크 거래 완료','[계좌 이용 내역] 화면에 반영됩니다.');
                    }
                });
            });
        });
    },

    callStudyInfo: async function (_study_id){
        return new Promise(function (resolve, reject){
            let time = setInterval(()=>{
                if((InitContract.AboutStudyInfoInstance!== null) && (InitContract.web3 !== null)){
                    clearInterval(time);
                    SetStudyEndTransfer.getStudyInfo(_study_id).then((res)=>{
                        resolve(res);
                    });
                }
            },100);
        });
    },

    getStudyInfo: async function (_study_id){
        return new Promise(function (resolve, reject){
            if((InitContract.AboutStudyInfoInstance!== null) && (InitContract.web3 !== null)){
                InitContract.AboutStudyInfoInstance.methods.getStudyInfo(_study_id).call().then(function(result) {
                    let endDate =  InitContract.web3.utils.hexToUtf8(result.endDate); //스터디 종료날짜
                    let study_cnt = Number(result.study_cnt)
                    let data = [{'endDate':endDate},{'study_cnt':study_cnt}];
                    resolve(data);
                    // resolve(true);
                });
            }
        });
    },

    startTransaction: async function (_studyData,_personData){
        return new Promise(function (resolve, reject){
          console.log(_studyData, _personData);
          let study_id = _studyData[0].s_id;
          let study_coin = _studyData[0].study_coin;
          // 사용자 스터디 계좌> 사용자 본 계좌로 거래 기록 하기
          let content = 's_end';
          console.log({'study_id':study_id},{'study_coin':study_coin},{'content':content});
          
              for(let i = 0 ; i<_personData.length; i++){
                let resolveNum = i;
                let accountNum = _personData[i].account_num;
                InitContract.web3.eth.getBalance(accountNum).then((result)=>{
                    let minus = InitContract.web3.utils.fromWei(result, 'ether')/10;
                    let balance = InitContract.web3.utils.fromWei(result, 'ether') - minus;
    
                    let receiveEther = InitContract.web3.utils.toWei(String(balance), 'ether');
                    SetStudyEndTransfer.callMain_account_list(_personData[i]).then((account_num)=>{
                        console.log(account_num);
                    // study가 종료될 때 코인을 환급받는 메소드
                    SetStudyEndTransfer.AddMsgOfMainAccount(_personData[i], receiveEther, content, account_num, balance, study_id, i, _personData.length).then((is_end)=>{
                        if(is_end === true){
                            if(resolveNum === _personData.length -1){
                                console.log("★종료 트랜잭션 완료★");
                                resolve(true);
                            }
                        }
                    });
                });  
                });
              } 
        });
      },

    AddMsgOfMainAccount : async function(_personData, etherNum, _content, mainAccount, balance, _study_id, _resolveNum, _personLength){
        let is_end = false;
        console.log(_content);
        return new Promise(function (resolve, reject) {
            let person_id = _personData.PERSON_ID;
            let accountNum = _personData.account_num;
            let Ascii_person_id =  InitContract.web3.utils.fromAscii(person_id); 
            let Ascii_destination =  InitContract.web3.utils.fromAscii("Main#"+person_id); 
            let Ascii_startingPoint = 
            InitContract.web3.utils.fromAscii(_study_id+"#"+person_id);
            let Ascii_content = 
            InitContract.web3.utils.fromAscii(_content);
            let d = new Date();
            let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let date = d.getDate();
            let Ascii_date =  InitContract.web3.utils.fromAscii(year+'.'+month+'.'+date);
            console.log(Ascii_person_id);
            console.log(Ascii_destination);
            console.log(Ascii_startingPoint);
            console.log(etherNum);
            console.log(Ascii_date);
            console.log(Number((100/_personLength)*_resolveNum).toFixed(0));
            let idx_hash = Sha256(d+"_"+person_id+"Main#"+person_id+etherNum).substr(0,64);
            console.log('본 계좌 입장 트랜잭션 발생: ',idx_hash);
            InitContract.web3.eth.personal.unlockAccount(accountNum, "", 10000)
            .then(()=>{
                console.log(person_id+" account_unlock");
                InitContract.MainAccountTransferInstance.methods.setMainAccountTransfer(
                    mainAccount, Ascii_destination, Ascii_startingPoint, etherNum, Ascii_date, Ascii_content, mainAccount, '0x'+idx_hash
                ).send(
                    {
                        from: accountNum, // 각 스터디 개인 계좌
                        value: String(etherNum),
                        gas: 1000000
                    }
                ).on('error', function(error){ console.log(error); })
                .on('transactionHash', function(transactionHash){ console.log(transactionHash);  })
                .on('confirmation', (confirmationNumber, receipt) => {
                    if(is_end === false){
                        console.log("거래 내역 저장 완료");
                        DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), mainAccount);
                        console.log(confirmationNumber);
                        console.log(receipt);
                        if(is_end === false){
                            is_end = true;
                            let personName = _personData.PERSON_NAME;
                            let Ascii_personName = InitContract.web3.utils.fromAscii(personName); 
                            console.log(personName);
                            SetStudyEndTransfer.AddMsgOfEndTheStudy(Ascii_person_id, Ascii_personName, etherNum, _study_id, Ascii_date, mainAccount).then((res_is_end)=>{
                                if(res_is_end === true){
                                    resolve(true);
                                }
                            });
                        }
                    }
                });
            });
        });
    },

    AddMsgOfEndTheStudy : async function(person_id,_personName, etherNum, _studyId, date, receiver_Account){
        let is_end = false;
        return new Promise(function (resolve, reject) {
            let idx_hash = Sha256(date+"_"+person_id+"Main#"+person_id+etherNum+"_"+_studyId+"_"+_personName).substr(0,64);
            console.log('스터디 계좌 입장 트랜잭션 발생: ',idx_hash);
            InitContract.web3.eth.personal.unlockAccount(InitContract.myAccount[0], process.env.REACT_APP_GETH_MANAGER_PWD, 10000)
            .then(()=>{
                InitContract.StudyEndTransferInstance.methods.endTheStudy(
                    _studyId, person_id, _personName, etherNum, date, '0x'+idx_hash
                ).send(
                    {
                        from: InitContract.myAccount[0], // 관리자 계좌
                        gas: 1000000
                    }
                ).on('error', function(error){ console.log(error); })
                .on('confirmation', (confirmationNumber, receipt) => {
                    if(is_end === false){
                        console.log("종료 내역 저장 완료");
                        DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), receiver_Account);
                        // 종료 내용 db에 저장.
                        SetStudyEndTransfer.callEndStudy(_studyId).then(()=>{
                            resolve(true);
                        });
                    }
                });
            });
        });
    },

    // 종료날짜인 스터디 종료 여부 설정
    callEndStudy  : async function(_study_id){
        const url = '/api/setEndStudy';
            return post(url,  {
                study_id: _study_id
            });
    },
    
    // studyitem 항목 값 구하기
    callDBStudyItemInfo  : async function(_study_id){
        const response = await fetch('/api/studyItems/view/' + _study_id);
        const body = response.json();
        return body;
    },

    // study_join, person_info leader순으로 데이터 추출
    callDBStudyJoinInfo   : async function(_study_id){
        return new Promise(function (resolve, reject) {
            const url = '/api/community/getAccountInfo/personInfo/whereStudyJoin';
            post(url,  {
                study_id: _study_id
            }).then((res)=>{
                resolve(res.data);
            })
    
        });
    },

    // 사용자 주 계좌 정보 얻기
    callMain_account_list   : async function(_personData){
        return new Promise(function (resolve, reject) {
            let person_id = _personData.PERSON_ID;
            const url = '/api/select/main_account_list/ConfirmInformation';
            post(url,  {
                person_id: person_id
            }).then((res)=>{
                let data = res.data[0];
                resolve(data.account_num);
            });
        });
    },
};
  
export default SetStudyEndTransfer;