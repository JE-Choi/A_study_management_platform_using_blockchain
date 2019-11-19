// 블록체인
import getWeb3 from "../../utils/getWeb3";
import AboutStudyInfo from '../../contracts/AboutStudyInfo.json';
import MainAccountTransfer from '../../contracts/MainAccountTransfer.json';
import TardinessTransfer from '../../contracts/TardinessTransfer.json';
import QuizTransfer from '../../contracts/QuizTransfer.json';
import StudyEndTransfer from '../../contracts/StudyEndTransfer.json';
import $ from 'jquery';

const InitContract = {
    web3: null,
    myAccount: null,
    AboutStudyInfoInstance:null,
    accountsInfo: [],
    balance: 0 ,
    MainAccountTransferInstance:null,
    TardinessTransferInstance: null,
    QuizTransferInstance: null,
    StudyEndTransferInstance:null,
    
    // 계좌 목록 업데이트 + 생성된 계좌 반환
    updateAccounts : async function(){
      const myAccount = await InitContract.web3.eth.getAccounts();
      return new Promise(function (resolve, reject) {
        console.log('updateAccounts');
        // web3를 사용하여 사용자의 accounts 불러옴.
        
        InitContract.myAccount = myAccount;
        console.log("최종 계좌 개수: "+InitContract.myAccount.length);
        // console.log(myAccount);
        let account_index =  InitContract.myAccount.length - 1;
        console.log(account_index);

        let account_num = myAccount[account_index];
        console.log('['+(account_index)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났음.');

        let accountsSubInfo = [];
        accountsSubInfo.push({ account_index: account_index }); // 계좌 index
        accountsSubInfo.push({ account_num: account_num }); // 계좌 번호
        console.log(accountsSubInfo);
        resolve(accountsSubInfo);
      });
    },

    // 본 계좌 생성
    createMainAccount: async function(pwd){
      return new Promise(function (resolve, reject) {
        InitContract.accountsInfo = [];
        console.log("이전 계좌 개수: "+InitContract.myAccount.length);
        InitContract.web3.eth.personal.newAccount(pwd).then(()=>{
          InitContract.updateAccounts().then((accountsSubInfo)=>{
            console.log(accountsSubInfo);
            resolve(accountsSubInfo);
          });
        });
      });
    },

    // 계좌 생성
    createAccount: async function(pwdArray){
      
      InitContract.accountsInfo = [];
      console.log("이전 계좌 개수: "+InitContract.myAccount.length);
      console.log("생성될 계좌 개수: "+pwdArray.length+'   '+pwdArray);
      $('.sub_msg2').text('조금만 기다려 주세요...10%');
      pwdArray &&
      pwdArray.map(value => {
        console.log(value);
        $('.sub_msg2').text('조금만 기다려 주세요...30%');
        InitContract.web3.eth.personal.newAccount(value)
        .then((address)=>{
          console.log(address);
          $('.sub_msg2').text('조금만 기다려 주세요...50%');
          let accountsInfo = InitContract.accountsInfo;
          accountsInfo.push(address);
          $('.sub_msg2').text('조금만 기다려 주세요...70%');
        });
      });
    },

    // 사용자 수만큼 스터디 내 계좌 생성
    createStudyAccount: async function(personNum){
      InitContract.accountsInfo = [];
      console.log("이전 계좌 개수: "+InitContract.myAccount.length);
      console.log("생성될 계좌 개수: "+personNum);
      return new Promise(function (resolve, reject) {
        let accountsInfo = [];//new Array(personNum);
        for(let i = 0 ; i < personNum ; i++){
          // 계좌 생성
          InitContract.web3.eth.personal.newAccount("")
          .then((address)=>{ // address : 생성된 Ethereum 계좌번호
            // accountsInfo 배열 안에 address이 존재 하지 않는다는 것을 확인
            if(accountsInfo.indexOf(address) < 0 && address !== "" && address !== null && address !== undefined){
              // for문을 돌면서 accountsInfo안에 사용자 수만큼의 계좌가 삽입되었는지 확인되었다면 
              if(accountsInfo.length === personNum -1){
                accountsInfo.push(address);
                InitContract.accountsInfo = accountsInfo;
                console.log(i,address, accountsInfo);
                resolve(true); // 호출한 쪽으로 결과값 반환
              } else if(accountsInfo.length < personNum -1){
                accountsInfo.push(address);
                console.log(i,address, accountsInfo);
              }
            }
          });
        }
      });
    },

    // 잔액 확인
    getBalance: function(account_num){
      return new Promise(function (resolve, reject) {
        if(InitContract.web3 === null){
        InitContract.init().then(()=>{
           InitContract.web3.eth.getBalance(account_num).then(result=>{
            let _balance = InitContract.web3.utils.fromWei(result, 'ether');
            resolve(_balance);
          });
        });
      }
      else{
        InitContract.web3.eth.getBalance(account_num).then(result=>{
          let _balance = InitContract.web3.utils.fromWei(result, 'ether');
          resolve(_balance);
        });
      }
      });
    },

    init : async function() {
      console.log("web3로드 시작");
      const web3 = await getWeb3();
      const myAccount = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      return new Promise(function (resolve, reject) {
        try {
          // 스터디 관련 스마트 계약
          const AboutStudyInfo_deployedNetwork = AboutStudyInfo.networks[networkId];
          const instance_AboutStudyInfoInstance = new web3.eth.Contract(
            AboutStudyInfo.abi,
            AboutStudyInfo_deployedNetwork && AboutStudyInfo_deployedNetwork.address
          );

          // 본 계좌 관리 스마트 계약
          const deployedNetwork_MainAccount = MainAccountTransfer.networks[networkId];
          const instance_MainAccount = new web3.eth.Contract(
            MainAccountTransfer.abi,
            deployedNetwork_MainAccount && deployedNetwork_MainAccount.address
          );

          // 출석체크 관련 스마트 계약
          const deployedNetwork_TardinessTransfer = TardinessTransfer.networks[networkId];
          const instance_TardinessTransfer = new web3.eth.Contract(
            TardinessTransfer.abi,
            deployedNetwork_TardinessTransfer && deployedNetwork_TardinessTransfer.address
          );

          // 퀴즈 관련 스마트 계약
          const deployedNetwork_QuizTransfer = QuizTransfer.networks[networkId];
          const instance_QuizTransfer = new web3.eth.Contract(
            QuizTransfer.abi,
            deployedNetwork_QuizTransfer && deployedNetwork_QuizTransfer.address
          );

          // 스터디 종료 관련 스마트 계약
          const deployedNetwork_StudyEndTransfer = StudyEndTransfer.networks[networkId];
          const instance_StudyEndTransfer = new web3.eth.Contract(
            StudyEndTransfer.abi,
            deployedNetwork_StudyEndTransfer && deployedNetwork_StudyEndTransfer.address
          );
          
          if(web3 !== null){
            console.log("web3연결 성공");
          } else{
            //web3연결 실패
            console.log("인터넷을 연결 시켜주세요.");
          }

        //   web3, 계좌목록, 스마트 계약 인스턴스 state에 저장.
        InitContract.web3 = web3;
        InitContract.myAccount = myAccount;
        InitContract.AboutStudyInfoInstance = instance_AboutStudyInfoInstance;
        InitContract.MainAccountTransferInstance = instance_MainAccount;
        InitContract.TardinessTransferInstance =  instance_TardinessTransfer;
        InitContract.QuizTransferInstance = instance_QuizTransfer;
        InitContract.StudyEndTransferInstance = instance_StudyEndTransfer;

        resolve(true);
        } catch (error) {
          alert(
            `새로고침 해주세요.`,
          );
          console.error(error);
        }
      });
    }
};
  
export default InitContract;