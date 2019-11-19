import { post } from 'axios';
import $ from 'jquery';
import initContract  from './InitContract';
import alert from '../../utils/Alert';
import ConvertToEther from './ConvertToEther';

const CreateStudyTransaction = {
    is_createMemberContract : false,
    is_StudyEndTransfer : false,
    personAddressData: null,

    fillSubAccounts: async function (_studyData,_personData, _accountsInfo){
      return new Promise(function (resolve, reject){
        let study_id = _studyData[0].s_id;
        let study_coin = _studyData[0].study_coin;
      
        let content = 's_start';
        // 사용자 본계좌 > 스터디 계좌 차감 기록 하기
        for(let i = 0 ; i<_personData.length; i++){
          let person_id = _personData[i].PERSON_ID;
          let resolveNum = i;
          // 주(본)) 계좌 정보 조회
          CreateStudyTransaction.callCreateAccountInfoApi(person_id).then((m_account)=>{
            let account_Info = m_account.data[0];
           
            // 받는 사람 계좌 정보, 거래 진행하는 사람, ether값, 용도, 보내는 이, 스터디 
            ConvertToEther.run(_accountsInfo[i], person_id, study_coin, content, account_Info, study_id).then((is_end)=>{
              if(is_end === true){
                  if(resolveNum === _personData.length - 1){
                    $('.sub_msg2').text('조금만 기다려 주세요...65%');
                    resolve(true);
                  }
              }
          });
        });
        }            
      });
    }, 

    // 사용자 본계좌 잔액 확인 함수
    checkBalance: async function (account_num, study_coin){
      return new Promise(function (resolve, reject) {
        initContract.getBalance(account_num).then((balance)=>{
          console.log(balance);
          // 잔액이 충분한 경우
          if(balance > study_coin){
            resolve(true);
          }
          // 잔액보다 스터디 보증금이 큰 경우
          else{
            resolve(false);
          }
        });
      });
    },

    // 사용자 본계좌 잔액 확인 함수 Handler
    checkBalanceHandler: async function (_studyData,_personData){
      let lowBalanceArray = [];
      return new Promise(function (resolve, reject) {
        let study_coin = _studyData[0].study_coin;
        let personAddressData = [];
        for(let i = 0; i < _personData.length ; i++){
          let person_id = _personData[i].PERSON_ID;
          // 주 계좌 정보 조회
          CreateStudyTransaction.callCreateAccountInfoApi(person_id).then((m_account)=>{
            let account_num = m_account.data[0].account_num;
            personAddressData.push(m_account.data[0]);
            CreateStudyTransaction.checkBalance(account_num, study_coin).then((is_possibility)=>{
              console.log(is_possibility);
              if(is_possibility === false){
                let msg = _personData[i].PERSON_NAME+'님 ';
                lowBalanceArray.push(msg);
                if(i === _personData.length - 1 ){
                  resolve(lowBalanceArray);
                } 
              } else{
                if(i === _personData.length - 1 ){
                  CreateStudyTransaction.personAddressData = personAddressData;
                  resolve(lowBalanceArray);
              } 
              }
            });
          });
        }
      });
    },

    // 주 계좌 정보 조회
    callCreateAccountInfoApi : async function(person_id){
      const url = '/api/select/main_account_list/ConfirmInformation';
      return post(url,  {
          person_id : person_id
      });
    },

    // 스터디 계좌 정보 조회
    callSubAccountInfoApi : async function(_person_id, _study_id){
      const url = '/api/community/loadAccountIndex';
      return post(url,  {
        study_id: _study_id,
        person_id : _person_id
      });
    },

    setStudyInfo  : async function(studyData) {
      let is_setStudyInfo = true
      return new Promise(function (resolve, reject) {
        $('.sub_msg2').text('조금만 기다려 주세요...75%');
        let _studyId = studyData[0].s_id;
        let _endDate = new Date(studyData[0].end_date);
        let study_cnt = studyData[0].study_cnt;
        let year  = _endDate.getFullYear();
        let month = _endDate.getMonth()+1;
        let date = _endDate.getDate();
        let day = year+'-'+month+'-'+date; 
        let Ascii_endDate =  initContract.web3.utils.fromAscii(day); 
        initContract.AboutStudyInfoInstance.methods.setStudyInfo(_studyId, Ascii_endDate, study_cnt).send(
        {
                from: initContract.myAccount[0], // 관리자 계좌
                gas: 6000000 
        }
        )
        // receipt 값이 반환되면 트랜잭션의 채굴 완료 된 상태
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log('setStudyInfo 완료');
          if(is_setStudyInfo === true){
            is_setStudyInfo = false;
            resolve(true);
          }
        });
      });
  },

  // myPage에서 스터디 모집 완료하기(is_start = 0)
  callStartStudy : async function (_study_id){
    const url = '/api/myPage/start_Study';
    post(url,  {
        study_id: _study_id,
        is_start : 0
    });
  },

  // 사용자에게 계좌 할당 + 사용자 등록 트랜잭션 발생 
  createAccount : async function(studyData, personData) {
    return new Promise(function (resolve, reject) {
      
      CreateStudyTransaction.is_createMemberContract = false;
     
      // 계정 생성 
      let study_id = studyData[0].s_id;
      CreateStudyTransaction.checkBalanceHandler(studyData,personData).then((_lowBalanceArray)=>{
        console.log('_lowBalanceArray.length: ', _lowBalanceArray.length);
        if(_lowBalanceArray.length !== 0){
          $('.progress_layer').hide();
          let lowBalanceArray ='';
          _lowBalanceArray && _lowBalanceArray.map (value =>{
            lowBalanceArray = lowBalanceArray + value;
          })
          lowBalanceArray = lowBalanceArray +'의 Ether가 부족합니다.';
          CreateStudyTransaction.callStartStudy(study_id);
          alert.confirm('[Ether 부족]', lowBalanceArray);
        } else{
          // 계좌 생성
          initContract.createStudyAccount(personData.length)
          .then((_accountsInfo)=>{
            $('.sub_msg2').text('조금만 기다려 주세요...30%');
            console.log(_accountsInfo);
            if(_accountsInfo === true){
              console.log(initContract.accountsInfo);
              let accountsInfo = initContract.accountsInfo;
              CreateStudyTransaction.callCreateAccountApi(accountsInfo, personData, study_id).then((res) => {
              CreateStudyTransaction.fillSubAccounts(studyData, personData, accountsInfo).then((is_end)=>{
                CreateStudyTransaction.setStudyInfo(studyData).then((is_end)=>{
                  resolve(true);
                });
              });
              });
            }
        });
        }
      }); 
    });
  },

  // 블록체인 계좌생성 후 DB에 account_list에 삽입. 
  callCreateAccountApi : async function (_accountsInfo, _personData, _study_id){
    return new Promise(function (resolve, reject) {
      const url = '/api/createAccount';
      for(let i = 0; i< _personData.length; i++){
        let person_id = _personData[i].person_id;
        let account_num = _accountsInfo[i];
        post(url,  {
          person_id: person_id,
          account_num: account_num,
          account_pw: "",
          study_id : _study_id
        });
      }
      resolve(true);
    });
  },

  startStudy : async function(studyData, personData) {
    // 사용자에게 계좌 할당 + 사용자 등록 트랜잭션 발생 
    return new Promise(function (resolve, reject) {
      CreateStudyTransaction.createAccount(studyData, personData).then((is_end)=>{
        console.log('startStudy 끝?: ' + is_end);
        if(is_end === true){
          resolve(true);
        }
        });
      });
    }
};
  
export default CreateStudyTransaction;