import React, { Component } from 'react';
import './CoinManagement.css';
import { post } from 'axios';
import $ from 'jquery';

// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class CoinManagement extends Component {
    render() {
        return (
            <div className="main_coinManagement">
                <div className="content_coinManagement">
                    <AboutCoin />
                </div>
            </div>
        )
    }
}

class AboutCoin extends Component{

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            userId:'',
            studyId:'',

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null
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
        
        
            // // 확인용 로그
            // console.log(ShopContract.abi);
            // console.log(web3);
            // console.log(myAccount);
          //   Set web3, accounts, and contract to the state, and then proceed with an
          //   example of interacting with the contract's methods.
          this.setState({ web3, myAccount, studyGroupInstance: instance});
          
            
          this.getUserNameSession().then(()=>{
            this.getEnterSession().then(()=>{
                this.callLoadAccountApi(this.state.userId,this.state.studyId).then((res)=>{
                    let account_id = res.data[0].account_id;
                    $('.account_number').val(myAccount[account_id]);
                    let account = myAccount[account_id];
                    setTimeout(function(){
                        web3.eth.getBalance(myAccount[account_id]).then(result=>{
                        let balance = web3.utils.fromWei(result, 'ether');
                        $('#sum_of_coin').text(balance+'코인');
                    });
                }, 100);
                });
            });
        });
          } catch (error) {
            alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
          }
    };
    componentWillMount = async () => {
        this.initContract();
    };


    componentDidMount= async () => {

        this.initContract().then(()=>{
            this.getUserNameSession().then(()=>{
                this.getEnterSession().then(()=>{
                    this.getPersonInfoOfStudy(this.state.studyId,this.state.userId);
                });
            });
        });
    }

    // 사용자 이름 session 불러오기
    getUserNameSession = async () =>{
        if (typeof(Storage) !== "undefined") {
            await this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }
    // 사용자 ID, 들어온 스터디 번호 불러오기
    getEnterSession = async () => {
        if (typeof(Storage) !== "undefined") {
            await this.setState({userId : sessionStorage.getItem("loginInfo")});
            await this.setState({studyId : sessionStorage.getItem("enterStudyid")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    callLoadAccountApi = (_person_id,_study_id) => {
        const url = '/api/coinManagement/loadAccount';
        return post(url,  {
            person_id: _person_id,
            study_id: _study_id
        });
    }

    // StudyGroup.sol 파일의 studyMember구조체 load
    getPersonInfoOfStudy = async (_study_id, _person_id) => {
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

    render(){
        return(
            <div className="div_coin_management">
                <div className="coin_management_header">{this.state.userName} 님의 계좌 번호</div>
                <div className="div_account_number">
                    <input type="text" className="form-control account_number" disabled/>
                </div>
                <div className="coin_management_content">
                    <span className="coin_status_text">잔여 코인</span>
                    <span className="btn btn-danger" id="sum_of_coin"></span> 
                </div>
                <div className="content_coin_usage">
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 03 / 02</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-0.5</span>
                    </div>
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 03 / 23</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-0.5</span>
                    </div>
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 04 / 13</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-0.5</span>
                    </div>
         
                </div>
            </div>
        );
    }
}

export default CoinManagement;