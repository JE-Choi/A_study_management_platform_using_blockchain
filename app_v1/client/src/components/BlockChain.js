import React, { Component } from "react";
import './BlockChain.css';
//import "./App.css";


// import ShopContract from "../contracts/Shop.json"; 
import getWeb3 from "../utils/getWeb3";

import StudyGroup from "../contracts/StudyGroup.json"; 
// import {encode} from 'utf8';

import { post } from 'axios';
import $ from 'jquery';
// import { format } from "util";

// $(document).ready(function(){
//   alert('hihi?');
// });

// import Web3 from "web3";

// const getWeb3 = () =>
//   new Promise((resolve, reject) => {
//     var url = 'https://ropsten.infura.io/v3/14e4daadf0e5435cb5948913c3f9351f';
//     const provider = new Web3.providers.HttpProvider(
//       url
//     );
//     const web3 = new Web3(provider);
    
//     resolve(web3);
//   });


class BlockChain extends Component {
  
  constructor(props) {
    super(props);
  
    this.state = {
      // shopInstance: null,
      studyGroupInstance:null,
      myAccount: null,
      myApples: 0,  // myApples 추가
      web3: null,

      account_pw:''
    };
  }
  
     componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
     
      // Use web3 to get the user's accounts.
      const myAccount = await web3.eth.getAccounts();

      // Get the contract instance.
      // const networkId = await web3.eth.net.getId();
      // const deployedNetwork = ShopContract.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   ShopContract.abi,
      //   deployedNetwork && deployedNetwork.address
      // );
      
      const networkId2 = await web3.eth.net.getId();
      const deployedNetwork2 = StudyGroup.networks[networkId2];
      const studyGroupInstance = new web3.eth.Contract(
        StudyGroup.abi,
        deployedNetwork2 && deployedNetwork2.address
      );

      // // 확인용 로그
      // console.log(ShopContract.abi);
      // console.log(deployedNetwork);
      // console.log(deployedNetwork.address);
      console.log(deployedNetwork2);
      console.log(deployedNetwork2.address);
      // console.log('instance: ' + instance);
      // console.log(myAccount);
      // console.log('studyGroupInstance: ' + studyGroupInstance);
      
     
    //   Set web3, accounts, and contract to the state, and then proceed with an
    //   example of interacting with the contract's methods.
     
    this.setState({ web3, myAccount,studyGroupInstance:studyGroupInstance});
    // this.setState({ web3, myAccount, shopInstance: instance});
    // this.updateMyApples(); 

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

  // buyApple 돈 나감.
  // buyApple() {
  //   const { shopInstance, myAccount, web3} = this.state; 
  //   shopInstance.methods.buyApple().send(
  //   {  
  //     from: myAccount[0],  // 돈 나가는 사람
  //     gas: 3000000, 
  //     value: web3.utils.toWei('0.1', 'ether')
  //   }).catch((err) => {
  //     console.log(err);
  //   });
  // }
  //  // sellApple 실행가능
  // sellApple() {
  //   const { shopInstance, myAccount, web3} = this.state; 
    
  //   shopInstance.methods.sellMyApple( web3.utils.toWei('0.1', 'ether')).send(
  //     {
  //       from: myAccount[0], // 돈 들어오는 사람
  //       gas: 3000000
  //     }
  //   );
  // }

  // // updateMyApples는 실행가능.
  // updateMyApples() {
  //   const { shopInstance} = this.state; 
  //   shopInstance.methods.getMyApples().call().then(result=>{
  //     this.setState({ myApples: result });
  //   });
  // }

  handleValueChange = (e) => {

      let nextState = {};
      console.log(e.target.name + ': ' + e.target.value);
      nextState[e.target.name] = e.target.value;
      this.setState(nextState);

  }

  createAccount = async (_study_id) =>{
    const { shopInstance, myAccount, web3} = this.state; 
   
    // (예정) 계정 생성 전에 DB에 접근하여 중복되는 비밀번호 있는지 검사하고나서, 중복되는 게 없는 경우에만 회원가입 진행
    
    // 계정 생성 
    var account_pw = this.state.account_pw;
    await web3.eth.personal.newAccount(account_pw);
    console.log('사용된 패스워드: ' + account_pw);
    let myAccounts = await web3.eth.getAccounts();
    // (예정) 생성된 계좌의 잔액은 0Ether이다. 충전하는 부분 만들어야 한다.
    // 있는 계정들 모두 출력
    for(var i = 0 ; i < myAccounts.length; i++){
      console.log(myAccounts[i]);
    }
    // 마지막에 생성된 계정 index구하기
    var account_id =  myAccounts.length - 1;
    console.log(account_id);

    // (예정) DB 저장 시 계정 index값과 비밀번호, hash계정 값 저장해야함.
    var account_num = myAccounts[account_id];
    console.log('['+(account_id)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났고, 비밀번호는 ' + account_pw);
     
    // DB에 값 삽입
    this.callCreateAccountApi(account_id ,account_num,account_pw).then((response) => {
        //console.log(response.data);
        console.log(account_id+account_num+account_pw);
    }).catch((error)=>{
      console.log(error);
    });

    // .sol파일의 studyMember구조체 생성
    let person_id = 'gom';
    let memberAddress = account_num;
    let join_coin = 7;
    this.createMemberItem(_study_id , person_id, memberAddress, join_coin);
  }

  callCreateAccountApi = (_account_id,_account_num,_account_pw) => {
    const url = '/api/createAccount';
    return post(url,  {
        account_id: _account_id,
        account_num: _account_num,
        account_pw: _account_pw
    });
  }

  // .sol파일의 studyMember구조체 생성
  createMemberItem(_study_id, _person_id ,_memberAddress, _numOfCoins) {
    const { studyGroupInstance, myAccount, web3} = this.state; 

    let Ascii_person_id = web3.utils.fromAscii(_person_id);
    studyGroupInstance.methods.setPersonInfoOfStudy(_study_id, Ascii_person_id, _memberAddress,_numOfCoins).send(
      { from: myAccount[0],
        gas: 3000000 
      }
    );
  }

  // .sol파일의 studyMember구조체 load
  getPersonInfoOfStudy(_study_id, _person_id) {
    const { studyGroupInstance, web3} = this.state; 
    let Ascii_person_id = web3.utils.fromAscii(_person_id);
    studyGroupInstance.methods.getPersonInfoOfStudy(_study_id, Ascii_person_id).call().then(function(result) {
      var memberAddress =  result[0];
      var person_id = web3.utils.toAscii(result[1]);
      var study_id =  result[2];
      var numOfCoins =  result[3];
      console.log('memberAddress: ' + memberAddress);
      console.log('person_id: ' + person_id);
      console.log('study_id: ' + study_id);
      console.log('numOfCoins: ' + numOfCoins);
    });    
  }

  transferCoin= async () =>{
    const { studyGroupInstance, myAccount, web3} = this.state; 
    let myAccounts = await web3.eth.getAccounts();
    //var deposit = $('#deposit').val(); // .val() : getText()
    //studyGroupInstance.transferCoin(myAccount[0], {from: owner, value: web3.toWei(Number(deposit), "ether")});
    var numOfCoins = $('#NumOfCoins').val();
    // console.log();
    // myAccount[10] <- 이 계좌가 받는 사람 계좌.
    studyGroupInstance.methods.transferCoin(myAccounts[12]).send(
      {
        from: myAccounts[0], 
        value: web3.utils.toWei(numOfCoins, 'ether'),
        gas: 3000000 
      }
    );

  setTimeout(function(){
    web3.eth.getBalance(myAccounts[12]).then(result=>{
      console.log('이체 후 잔액은: ' + web3.utils.fromWei(result, 'ether'));
    });
  }, 1000);

    //web3.utils.fromWei(web3.eth.getBalance(myAccount[10]),"ether").toNumber() ;
    //console.log('[10] receiver_balance: '+receiver_balance);
    
    //console.log('입금액 : ' + deposit);
    // $('#deposit_money').text(deposit); // 입금액 .text('') : span의 setText()
    // var sender_balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]),"ether").toNumber() ;
    // $('#sender_balance').text('거래 전 : ' + sender_balance + '거래 후: ' + (sender_balance - deposit));
    // var receiver_balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]),"ether").toNumber();
    // $('#receiver_balance').text('거래 전 : ' + receiver_balance + '거래 후: '+ (receiver_balance + Number(deposit)));

    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }
    //   //var send_account = accounts[1]
      
    //   //var account = accounts[0];
    //   App.contracts.RealEstate.deployed().then(function(instance) {
    //     //var nameUtf8Encoded = utf8.encode(name);
    //     for(var i = 0 ; i < accounts.length; i++){
    //       console.log(web3.eth.accounts[i]);
    //     }
    //     //var nameUtf8Encoded = utf8.encode('sejong');

    //     var nameUtf8Encoded = utf8.encode("gom");
        
    //     return instance.buyRealEstate(1, web3.toHex(nameUtf8Encoded), 13, {from: web3.eth.accounts[2], value: web3.toWei(Number(deposit), "ether")});
    //   })
    // });
  }

  list = async () =>{
    const { studyGroupInstance, myAccount, web3} = this.state; 
    let myAccounts = await web3.eth.getAccounts();
    // (예정) 생성된 계좌의 잔액은 0Ether이다. 충전하는 부분 만들어야 한다.
    // 있는 계정들 모두 출력
    for(var i = 0 ; i < myAccounts.length; i++){
      console.log('['+i+'] '+myAccounts[i]);
    }
  }

  // 스마트 계약 지각 거래발생
  setTardinessTransfer = async () =>{
    const { studyGroupInstance, myAccount, web3} = this.state; 
    // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
    let sender = web3.utils.fromAscii('Kim');
    let receiver = web3.utils.fromAscii('Choi');
    // let sender = web3.utils.fromAscii('Choi');
    // let receiver = web3.utils.fromAscii('Kim');
    let coin =3;
    let date = web3.utils.fromAscii('2019.04.06');
    let person_id = web3.utils.fromAscii('Choi');
    let study_id = 15;
    studyGroupInstance.methods.setTardinessTransfer(sender, receiver, coin, date, person_id, study_id).send(
      { from: myAccount[0],
        gas: 3000000 
      }
    );
  }

  getTardinessTransfer = async () =>{
    const { studyGroupInstance, myAccount, web3} = this.state; 
    
    studyGroupInstance.methods.getTardinessTransfer(web3.utils.fromAscii('Kim')).call().then(function(result) {
      
      let transactions = result[0];
      var transactions_list = new Array();

      for(let i = 0; i < transactions.length; i++){
      
      var transactions_list_sub = new Array();
      let transactions_web3_sender = transactions[i]._sender;
      let transactions_web3_receiver = transactions[i]._receiver;
      let transactions_web3_coin = Number(transactions[i]._coin);
      let transactions_web3_date = transactions[i]._date;
      
      transactions_list_sub.push(transactions_web3_sender,transactions_web3_receiver,transactions_web3_coin,transactions_web3_date);
      
      transactions_list.push(transactions_list_sub);
      
      }
      for(let i = 0; i < transactions_list.length; i++){
        // 블록체인에 date32타입으로 저장되었었기 때문에 변환을 거쳐야 메세지를 볼 수 있다.
        let transactions_web3_sender = transactions_list[i][0];
        let transactions_web3_receiver = transactions_list[i][1];
        let transactions_web3_coin = transactions_list[i][2];
        let transactions_web3_date = web3.utils.toAscii(transactions_list[i][3]);
        console.log(transactions_web3_sender); 
        console.log(transactions_web3_receiver);
        console.log(transactions_web3_coin);
        console.log(transactions_web3_date);
      }
     
      // console.log('memberAddress: ' +web3.utils.toAscii( memberAddress[0]));
      // console.log('memberAddress: ' + web3.utils.toAscii( memberAddress[1]));
      // console.log('memberAddress: ' + web3.utils.toAscii( memberAddress[2]));
      // console.log('person_id: ' + person_id);
      // console.log('study_id: ' + study_id);
      // console.log('numOfCoins: ' + numOfCoins);
    });    
  }
  render() {
    return (
      <div className="blockChainContainer">
        <h1>사과의 가격: 10 ETH</h1>
        <button onClick={() => this.buyApple()}>구매하기</button>
        <p>내가 가진 사과: {this.state.myApples}</p>
        <button onClick={() => this.sellApple()}>
          판매하기 (판매 가격: {10 * this.state.myApples})
        </button>
        {/* <!--J--> */}
        <div id="createAccount_template">
          <div>회원 가입할 계좌 이름: 
            <input type = "text" id="createInput" name="account_pw" value={this.state.account_pw} onChange={this.handleValueChange}/>
            <input type = "button" value = "계좌 생성" onClick={() => this.createAccount(15)}/>
            <span id="createInfo"></span>
          </div>  
        </div>
        <input type="button" value="계좌 정보 보기" onClick={() => this.getPersonInfoOfStudy(10,'user')}/>
        <input type="button" value="계좌 정보 보기" onClick={() => this.getPersonInfoOfStudy(15,'gom')}/>
        <br/>
        <input type = "text" size="10" id = "NumOfCoins"/>
        <input type = "button" value="코인 입금" onClick={() => this.transferCoin()}/>
        <input type = "button" value="리스트" onClick={() => this.list()}/>
        <br/>
        <input type = "button" value="거래내역 기록" onClick={() => this.setTardinessTransfer()}/>
        <input type = "button" value="거래내역 보가" onClick={() => this.getTardinessTransfer()}/>
      </div>
    );
  }
}

export default BlockChain;