import React, { Component } from 'react';
// import './CoinManagement.css';
import { post } from 'axios';
import $ from 'jquery';
import ProgressBar from './ProgressBar';


// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class EndDateReturnCoin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            studyId: '',

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,

            // progress 
            completed: 0
        }
    }

    initContract = async () => {
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3();
         
          // Use web3 to get the user's accounts.
          const myAccount = await web3.eth.getAccounts();
      
          // Get the contract instance.
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = StudyGroup.networks[networkId];
          const instance = new web3.eth.Contract(
            StudyGroup.abi,
            deployedNetwork && deployedNetwork.address
          );
      
      
          // 확인용 로그
          if(web3 !== null){
                console.log("web3연결 성공");
                console.log(instance);
            } else{
                //web3연결 실패
                console.log("인터넷을 연결 시켜주세요.");
            }
        //   Set web3, accounts, and contract to the state, and then proceed with an
        //   example of interacting with the contract's methods.
        this.setState({ web3, myAccount, studyGroupInstance: instance});
      
        } catch (error) {
          alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }
    };


    componentDidMount(){
        this.initContract().then(()=>{
            // let hour = 1000*60*60; // 1시간
            // let minutes = 1000*60; // 1분
            // let interval_time = minutes * 1; // 12시간


            // setInterval(function() { 
            //     let today = new Date();
            //     // let c_year = today.getFullYear();
            //     // let c_month = today.getMonth() + 1;
            //     // let c_date = today.getDate();

            //     // // let day = 
            //     let  c_hour = today.getHours();
            //     let c_min = today.getMinutes();
            //     let c_sec = today.getSeconds(); 
            //     // document.write(c_hour+":"+c_min+":"+c_sec+"<br/>");
            //     if (c_hour === 17 && c_min === 2 &&  c_sec === 0) {
            //         // document.write('내용1'); // 08시부터 21시 이전까지 실행되는 내용
            //         this.startEndStudyScan();
            //     }
            //     // else {
            //     //     document.write('내용2'); // 21시부터 아침 08시 이전까지 실행
            //     // }
                

            // }, 1000);
        });
    }

    startEndStudyScan = async () =>{
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let date = today.getDate();
        let day = year+'-'+month+'-'+date
       console.log(day);
        this.callEndDateStudy(day).then((res)=>{
            // 종료일자가 오늘 날짜인것들이 쿼리 결과가 나옴. 
            let datas = res.data;
            if(datas.length === 0){
                console.log("진행할 거래 없음.");
            } else{
                console.log(datas);
                for(let i = 0; i<datas.length;i++){
                    // this.setState({
                    //     studyId: datas[i].s_id
                    // });
                    let studyId = datas[i].s_id;
                    // this.processEndDate(datas,i).then(()=>{
                        this.getStudyEndTransfer(studyId).then((is_end)=>{
                            //gom 주석풀기
                            // 스터디 종료 거래 여부 = false 이고 종료 날짜가 오늘이 맞는지 (true)
                            if(is_end !== false){
                                //DB에서 해당 스터디에 속한 스터디 원 추출
                                this.callEndDatePerson(studyId).then((res)=>{
                                    let personDate = res.data;
                                    console.log(personDate);
                                    // 종료될 스터디에 속한 스터디 원들의 종료 거래 실행
                                    for(let j = 0; j < personDate.length; j++){
                                        // 계좌index 추출
                                        this.callEndDatePersonAccount(studyId, personDate[j].person_id).then((res)=>{
                                            // console.log(res.data);
                                            let personAccounts = res.data;
                                            // console.log(personAccounts);
                                            // 스터디 내의 스터디 원들의 종료 내역 저장
                                            this.processEndDateHandle(personAccounts, personDate[j], is_end).then(()=>{

                                            });
                                        });
                                    }
                                    
                                    // StudyGroup.sol스터디구조체.종료거래여부 = true로 수정
                                    this.renameStudyEndTransfer(studyId);
                                    this.callEndStudy(studyId);

                                });

                            } else{
                                console.log(studyId + ': 종료된 거래입니다.');
                            }
                        });
                        // // 종료날짜인 스터디에 속한 스터디원 추출
                        // this.callEndDatePerson(this.state.studyId).then((res)=>{
                        //     let personDate = res.data;
                        //     for(let j = 0; j < personDate.length; j++){
                        //         this.processEndDatePersonAccount(this.state.studyId,personDate[j]);
                        //     }
                        // });
                    // });
                }
            }
        });
    }
    
    // 종료일자가 오늘 날짜인것들이 스터디 추출
    callEndDateStudy = (_today) => {
        const url = '/api/manager/callEndDateStudy';
        return post(url,  {
            today: _today
        });
    }

    // 종료날짜인 스터디에 속한 스터디원 추출
    callEndDatePerson = (_study_id) => {
        const url = '/api/manager/callEndDatePerson';
        return post(url,  {
            study_id: _study_id
        });
    }

    // callEndDateStudy, callEndDatePerson 쿼리문 사용
    // study_id, person_id StudyGroup.sol에서 사용자 정보 구조체 조회 시 사용
    // StudyGroup.sol 거래 내역 추가시킬 때 사용
    // 종료날짜인 스터디에 속한 스터디원 추출
    processEndDate(datas,i){
        let s_id = datas[i].s_id;
        console.log(s_id);
        console.log(datas[i]);
        let study_namne = datas[i].study_name;
        let study_type = datas[i].study_type;
        let study_coin = datas[i].study_coin;
        this.setState({
            studyId: datas[i].s_id
        });
    }

    // 종료날짜인 스터디에 속한 스터디원의 계좌 정보 추출
    callEndDatePersonAccount = (_study_id, _person_id) => {
        const url = '/api/manager/callEndDatePersonAccount';
        return post(url,  {
            study_id: _study_id,
            person_id: _person_id
        });
    }

    // 종료날짜인 스터디에 속한 스터디원의 계좌 정보 추출
    callEndStudy = (_study_id) => {
        const url = '/api/manager/endStudy';
        return post(url,  {
            study_id: _study_id
        });
    }

    // callEndDatePersonAccount 쿼리 처리
    // account_index -> 잔액 반환에 이용
    processEndDatePersonAccount = async (_s_id,data) => {
        let personAccount = null;
        this.callEndDatePersonAccount(_s_id, data.person_id).then((res)=>{
            console.log(res.data);
            personAccount = res.data;
            
        });
        return personAccount;
    }
    
    // studyGroup.sol에 저장된 스터디 구조체의 종료 여부 판단하고 종료 날짜와 비교
    getStudyEndTransfer = async (_studyId) =>{
        const {web3, studyGroupInstance} = this.state; 
        let endDate = '';
        let isEndDateDeal = '';
        // studyGroup.sol에 저장된 스터디 구조체의 종료 여부 판단하고 종료 날짜와 비교
        await studyGroupInstance.methods.getStudyEndTransfer(_studyId).call().then(function(result) {
            endDate =  web3.utils.hexToUtf8(result[0]);
            isEndDateDeal = result[1];
            console.log(result);
        });
        console.log(endDate);
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let date = today.getDate();
        let day = year+'-'+month+'-'+date

        // gom 주석풀기
        // 스터디 종료 거래가 실행된 적이 없는가?
        if(isEndDateDeal === false){
            // 종료날짜가 오늘이 확실한가?
            if(day === endDate){
                console.log('종료날짜이고, 종료 처리 안됨.');
                return endDate;
            } else{
                return false;
            }
        } 
        // 종료 거래 실행된 적있는 스터디
        else{
            console.log('종료날짜이기는 하지만, 종료처리가 된 구조체임');
            return false;
        }
    }

     // studyGroup.sol에 스터디 종료 여부, 종료 내역 저장
     //uint _studyId, bytes32 _personId, bytes32 _personName, uint _receiveEther,  bytes32 _endDate
     setStudyEndTransfer = async (_personAccounts, _personDate, _endDate) =>{
        const {web3, studyGroupInstance, myAccount} = this.state; 
        // 종료될 스터디 내의 스터디 원 수만큼 반복
        for(let i = 0; i < _personAccounts.length; i++){
            let studyId = _personDate.study_id;
            let Ascii_personId = web3.utils.fromAscii(_personDate.person_id);
            let Ascii_endDate =  web3.utils.fromAscii(_endDate);
            let account_index = _personAccounts[i].account_index;
            console.log(account_index);
            web3.eth.getBalance(myAccount[account_index]).then((result)=>{
                let balance = web3.utils.fromWei(result, 'ether') - 0.001;
                
                console.log(balance);


                let receiveEther =web3.utils.toWei(String(balance), 'ether');
                console.log(studyId);
                console.log(Ascii_personId);
                console.log(receiveEther);
                console.log(Ascii_endDate);
                // study가 종료될 때 코인을 환급받는 메소드
                studyGroupInstance.methods.endTheStudy(studyId, Ascii_personId, receiveEther, Ascii_endDate).send(
                {
                        from: myAccount[account_index], // 출금될 계좌
                        value: web3.utils.toWei(String(balance), 'ether'),
                        gas: 0 
                })     // receipt 값이 반환되면 트랜잭션의 채굴 완료된 상태
                .on('confirmation', (confirmationNumber, receipt) => {
                    console.log(receipt);
              
                });
            });
        }
        
        // let study_make_ether = study_make_coin / 10;
        // console.log(_studyId);
        // console.log(_endDate);
        // let Ascii_endDate =  web3.utils.fromAscii(_endDate); 
        // console.log(Ascii_endDate);
        //uint _studyId, bytes32 _endDate
        // studyGroup.sol에 스터디 종료 여부, 종료 내역 저장
        // studyGroupInstance.methods.setStudyEndTransfer(_study_id, Ascii_endDate).send(
        // {
        //         from: myAccount[0], // 관리자 계좌
        //         value: web3.utils.toWei(String(study_make_ether), 'ether'),
        //         gas: 0 
        // });
        // console.log(endDate);
        // let today = new Date();
        // let year = today.getFullYear();
        // let month = today.getMonth() + 1;
        // let date = today.getDate();
        // let day = year+'-'+month+'-'+date
        
        // // 스터디 종료 거래가 실행된 적이 없는가?
        // if(isEndDateDeal === false){
        //     // 종료날짜가 오늘이 확실한가?
        //     // 바꿔야함 if( day === endDate){
        //     if( '2019-5-18' === endDate){
        //         return true;
        //     } else{
        //         return false;
        //     }
        // }
    }
    // StudyGroup.sol에서 스터디 종료 거래 부분 제어
    processEndDateHandle = async (_personAccounts, _personDate, _endDate) =>{
        // _personAccounts 사용자 account_list 정보
        // _personDate 사용자 person_info 정보
        console.log(_personAccounts);
        console.log(_personDate);
        console.log(_endDate);
        // StudyGroup.sol의 스터디 종료 내역 저장
        this.setStudyEndTransfer(_personAccounts, _personDate, _endDate);
    }

    
    showEndStudyScan = async()=>{
        const { web3, studyGroupInstance} = this.state; 
            //getStudyEndTransferManageList
            await studyGroupInstance.methods.getStudyEndTransferManageList().call().then(function(result) {
                
                if(result.length != 0 ){
                    for(let i = 0; i < result.length ; i++){
                        let studyId = String(result[i].studyId);// 반환받아야 하는 스터디 id
                        let personId = web3.utils.hexToUtf8(result[i].personId); // 반환받아야 하는 사람
                        let personName = web3.utils.hexToUtf8(result[i].personName); // 반환받아야 하는 사람 이름
                        let receiveEther = web3.utils.fromWei(String(result[i].receiveEther), "ether" ); // 반환받아야 하는 사람 ether값
                        let endDate = web3.utils.hexToUtf8(result[i].endDate); // 반환 요청된 날짜
                        console.log(studyId);
                        console.log(personId);
                        console.log(personName);
                        console.log(receiveEther);
                        console.log(endDate);
                        console.log('');
                    }
                } else{
                    console.log('진행된 거래 없음');
                }
            });
    }
    // (스터디 별 )지정한 스터디의 종료 내역
    getStudyEndTransferList = async()=>{
        const { web3, studyGroupInstance} = this.state; 
            let studyId = 32;
            await studyGroupInstance.methods.getStudyEndTransferList(studyId).call().then(function(result) {
                
                if(result.length != 0 ){
                    for(let i = 0; i < result.length ; i++){
                        let studyId = String(result[i].studyId);// 반환받아야 하는 스터디 id
                        let personId = web3.utils.hexToUtf8(result[i].personId); // 반환받아야 하는 사람
                        let personName = web3.utils.hexToUtf8(result[i].personName); // 반환받아야 하는 사람 이름
                        let receiveEther = web3.utils.fromWei(String(result[i].receiveEther), "ether" ); // 반환받아야 하는 사람 ether값
                        let endDate = web3.utils.hexToUtf8(result[i].endDate); // 반환 요청된 날짜
                        console.log(studyId);
                        console.log(personId);
                        console.log(personName);
                        console.log(receiveEther);
                        console.log(endDate);
                        console.log('');
                    }
                } else{
                    console.log('진행된 거래 없음');
                }
            });
    }

    renameStudyEndTransfer = async(_studyId)=>{
        const {myAccount, studyGroupInstance} = this.state; 
        studyGroupInstance.methods.renameStudyEndTransfer(_studyId).send(
        {
                from: myAccount[0],
                gas: 0 
        })     
        // receipt 값이 반환되면 트랜잭션의 채굴 완료된 상태
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log(receipt);
        
        });
    }

    render() {
        return (
        <div>
            {this.state.web3?
                <div>
                    <div>오늘 종료된 스터디가 있는지</div>
                    <input type="button" value="스터디 스캔" onClick={this.startEndStudyScan}/>
                    <input type="button" value="스터디 종료" onClick={this.showEndStudyScan}/>
                    {/* <input type="button" value="스터디 종료" onClick={this.test}/>  */}
                </div>
                :<ProgressBar message ='로딩중'/>}
        </div>
            
        )
    }
}


export default EndDateReturnCoin;