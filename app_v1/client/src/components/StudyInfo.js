import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'
import { BrowserRouter as Link } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './PromptModal.css';
import $ from 'jquery';
import ProgressBar from './ProgressBar';

// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class StudyInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // 스터디 가입 테이블 삽입시 사용
            study_id: 0 ,
            leader_name:'',
            person_id: '',
            leader: 0,
            account_number: '',
            joinStudy: 1,
            JoinShowBtn: 0,
            person_name:'',
            account_idx: 0,

            // 스터디 정보 불러올 때 사용
            study_name: '' ,
            study_type: '',
            num_people: '',
            current_num_people: 0,
            study_coin: 0,

            study_start_date: '',
            study_end_date: '',

            dbStartDate:'',
            dbEndDate: '',

            study_desc: '',

            // 블록체인
            studyGroupInstance: null,
            myAccount: null,
            web3: null,
            account_pw: '',
            modal: false,
            transactionReceiptOfMemberItem:'', // 사용자 등록 트랜잭션 채굴 확인용
            transactionReceiptOfChargeTheCoin: '', // 사용자 이더 충전 트랜잭션 채굴 확인용
            isMemberItemTransfer: false, // 사용자 등록 트랜잭션 발생 유무
            // isChargeTheCoin: false, // 사용자 이더 충전 트랜잭션 발생 유무
        }
        this.toggle = this.toggle.bind(this);
    }

    // PromptModal
    toggle() {
        let account_pw_val = $('#input_promptModal').val();
        this.setState(prevState => ({
          modal: !prevState.modal,
          account_pw: account_pw_val
        }));
    
        if(this.state.modal === true){
            if(account_pw_val === ''){
                this.studyExchenageConfirm();
            } else{
                this.studyJoinConfirm();
            }
        }  
    }

    // 블록체인 속성 load
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
            //console.log(web3);
            //console.log(myAccount);
          if(web3 !== null){
              console.log("web3연결 성공");
          } else{
                  console.log("web3연결 실패");
          }
  
          //   Set web3, accounts, and contract to the state, and then proceed with an
          //   example of interacting with the contract's methods.
          this.setState({ web3, myAccount, studyGroupInstance: instance});
  
          } catch (error) {
            console.log("인터넷을 연결 시켜주세요.");
          }
    }
    
    componentDidMount() {
        this.initContract().then(()=>{
        this.callApi()
          .then(res => {
                let start_date = new Date(res[0].start_date);
                let end_date = new Date(res[0].end_date);
              
                let s_year = String(start_date.getFullYear());
                let s_month = String(start_date.getMonth()+1);
                let s_date = String(start_date.getDate());

                let view_start_date = s_year+'-'+s_month+'-'+s_date;

                let e_year = String(end_date.getFullYear());
                let e_month = String(end_date.getMonth()+1);
                let e_date = String(end_date.getDate());
                let e_hour = String(end_date.getHours());
                let e_minute = String(end_date.getMinutes());

                let view_end_date = e_year+'-'+e_month+'-'+e_date+'  '+e_hour+':'+e_minute;

              this.setState({study_item_info: res});
              this.setState ({
                study_name: res[0].study_name ,
                study_type: res[0].study_type,
                num_people: res[0].num_people,
                study_start_date: view_start_date,
                study_end_date: view_end_date,
                study_coin: res[0].study_coin,
                study_desc: res[0].study_desc
            });

        }).catch(err => console.log(err));

        this.callLeaderApi().then(res => {
            this.setState ({
                leader_name: res[0].person_name
            })
        })

        this.callCurrentPeopleApi().then(res => {
            this.setState ({
                current_num_people: res.data.length
            });
        })

        this.getSession();

        // 로그인하지 않은 상태, 스터디 가입하지 않은 사람이면 가입하기 버튼을 보이지 않게 함.
        setTimeout(() => {
            if(sessionStorage.getItem("loginInfo") === null){  
                this.setState({joinStudy: 1});
            }else{
                this.joinStudy();
            }
        }, 50);     
        });   
    }

    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id: sessionStorage.getItem("loginInfo")});
            this.setState({person_name : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    callApi = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callLeaderApi = async () => {
        const response = await fetch('/api/studyItems/view_leader/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callJoinApi = () => {

        const url = '/api/insert/study_join';
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id,
            leader: false,
            // account_number: '11-22'
        }).then(()=>{
            this.setState({
                isMemberItemTransfer: true, // 사용자 등록 트랜잭션 발생 
                // isChargeTheCoin: true,  // 이더 충전 트랜잭션 발생
            });
            this.createAccount(this.props.match.params.id).then((account_id)=>{
                setTimeout(()=>{
                    // 이더 충전 트랜잭션 발생
                    // this.chargeTheCoin(account_id).then(()=>{
                        // StudyGroup.sol파일의 studyMember구조체 생성
                        let person_id = this.state.person_id;
                        
                        // 사용자 등록 트랜잭션 발생 
                        this.createMemberItem(this.props.match.params.id, person_id, this.state.account_idx, this.state.person_name);
                        
                        let second = 1000;
                        let intervalTime = second * 2;
                        var refreshIntervalId = setInterval(()=>{
                            if((this.state.transactionReceiptOfMemberItem !== '')){
                                /* refreshIntervalId 중지 */
                                clearInterval(refreshIntervalId);
                                setTimeout(()=>{
                                    this.studyOkJoinConfirm();
                                },100);
                                this.props.history.push('/mainPage');
                            }
                        },intervalTime);
                    // });
                },1000);
                
            });
        })
    }

    callCurrentPeopleApi = () => {
        const url = '/api/select/study_join/where/study_id';

        return post(url, {
            study_id: this.props.match.params.id
        });
    }

    // 스터디 가입 확인창
    studyJoinConfirm = () => {
        confirmAlert({
          title: '스터디 가입',
          message: '스터디를 가입하시겠습니까?',
          buttons: [
            {
                label: '네',
                onClick: () => this.handleFormOkSubmit()
            },
            {
                label: '아니요',
                onClick: () => this.studyNoJoinConfirmOK()
            }
          ]
        })
    };

    // 스터디 삭제 확인창
    studyDeleteConfirm = () => {
        confirmAlert({
            title: '스터디 삭제',
            message: '스터디를 삭제하시겠습니까?',
            buttons: [
            {
                label: '네',
                onClick: () => this.deleteCustomer(this.props.match.params.id)
            },
            {
                label: '아니요'
            }
            ]
        })
    };

    // 스터디 삭제 안내창
    studyDeleteAlert = () => {
        confirmAlert({
            message: '스터디가 삭제되었습니다.',
            buttons: [
            {
                label: '확인'
            }
            ]
        })
    };
    

    studyExchenageConfirm = () => {

        setTimeout(()=>{
            confirmAlert({
                title: '비밀번호를 입력해주세요.',
                // message: this.state.study_coin+'코인 충전 시 '+ (5000*this.state.study_coin)+'원 입니다.(1코인당 5000원)',
                buttons: [
                  {
                      label: '확인'
                  }
                ]
              })
        },100);
        
    };

    handleFormOkSubmit(){
        this.callJoinApi();
    }
    // 스터디 가입 완료 확인창
    studyOkJoinConfirm = () => {
        confirmAlert({
            title: '스터디에 가입되셨습니다.',
            message: '자세한 사항은 MyPage에서 확인 가능합니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 스터디 가입 취소 확인창
    studyNoJoinConfirm = () => {
        confirmAlert({
            title: '스터디 가입을 취소했습니다.',
            buttons: [
                {
                    label: '확인'
                }
              ]
        })
    }

    // 스터디 가입 취소 확인 메소드를 호출하는 메소드
    studyNoJoinConfirmOK = () => {
        setTimeout(()=>{
            this.studyNoJoinConfirm();
        },100);
    }

    // 스터디 가입했는지 확인 쿼리
    joinStudy = () =>{
        const url = '/api/isCheckJoinAndLeader';
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id
        }).then((result)=>{
            this.setState({joinStudy:result.data.length});
            setTimeout(() => {

                if(result.data.length === 1) {
                    this.isStudyLeader(result.data[0].leader);
                } else{
                    this.isStudyLeader(0);
                }
            }, 100);
        });
    }

    // 해당 study의 방장인지 확인 쿼리
    isStudyLeader = (_leader) =>{
        this.setState({leader:_leader});
    }

    // 방장이 study 삭제하는 메소드
    deleteCustomer(_id) {
        const url = '/api/studyItems/' + _id;

        fetch(url, {
            method: 'DELETE'
        }).catch(err => console.log(err));
         setTimeout(() => {
            this.studyDeleteAlert();
            this.props.history.push('/mainPage');
        }, 500);   
    }

    createAccount = async (_study_id) =>{
         // 계정 생성 
         var account_pw = this.state.account_pw;
         console.log('사용된 패스워드: ' + this.state.account_pw);
         
         this.selectFromInitAccountList().then((init)=>{
             console.log('selectFromInitAccountList=> account_idx: '+this.state.account_idx);
             if(init.length === 1){
                 let account_num = init[0].account_num;
            
                 // DB에 값 삽입 account_num 
                 this.callCreateAccountApi(this.state.person_id, this.state.account_idx,
                     account_num, account_pw, _study_id).then((response) => {
                     console.log(this.state.person_id +' '+this.state.account_idx+' '+account_pw);
                     this.useInitAccount(this.state.account_idx).then((res)=>{
                         console.log(res);
                         
                     });
                     
                     
                 }).catch((error)=>{
                 console.log(error);
             
                 });
                 
             } else{
                 console.log("계좌 생성시 오류");
             }
             
         });
    }

    callCreateAccountApi = (_person_id,_account_index,_account_num,_account_pw,_study_id) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_index: _account_index,
            account_num: _account_num,
            account_pw: _account_pw,
            study_id: _study_id
        });
    }

    // // 매개변수로 들어온 _account_id에게 ether 지급.
    // chargeTheCoin = async () =>{
    //     const { studyGroupInstance, myAccount, web3} = this.state; 
    //     let study_make_coin = this.state.study_coin;
    //     // 1코인당 0.1ether를 충전하기 위한 변환 과정
    //     let study_make_ether = study_make_coin / 10;
    //     let account_id = Number(this.state.account_idx);
        
    //     // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
    //     studyGroupInstance.methods.chargeTheCoin(myAccount[account_id]).send(
    //         {
    //         from: myAccount[0], 
    //         value: web3.utils.toWei(String(study_make_ether), 'ether'),
    //         // gasLimit 오류 안나서 일단은 gas:0 으로 했지만 오류 나면 3000000로 바꾸기
    //         gas: 0 
    //       }
    //     )
    //     // receipt 값이 반환되면 트랜잭션의 채굴 완료 된 상태
    //     .on('confirmation', (confirmationNumber, receipt) => {
    //         console.log('chargeTheCoin')
    //         console.log(receipt);
    //         let transactionReceiptOfChargeTheCoin = receipt;
    //         this.setState({
    //             transactionReceiptOfChargeTheCoin:transactionReceiptOfChargeTheCoin
    //         });
    //         // 이더 충전 트랜잭션 채굴 완료
    //         this.setState({
    //             isChargeTheCoin: false
    //         });
    //     });
    // }

    // 계좌 불러오기
    selectFromInitAccountList  = async () => {
        const url = '/api/selectFromInitAccountList';
        const response = await fetch(url);
        const body = await response.json();
        
        // 배정할 계좌의 인덱스 저장
        if(body.length === 1){
            this.setState({
                account_idx : body[0].account_index
            });
        }
        return body;
    }
    // 계좌 속성 변경
    useInitAccount = async (_account_index) => {
        const url = '/api/useInitAccount';
        console.log(_account_index);
        return post(url,  {
            account_index: _account_index
        });
    }

    // StudyGroup.sol파일의 studyMember구조체 생성
    createMemberItem = async (_study_id, _person_id ,_account_id, _person_name) => {
        const { studyGroupInstance, myAccount, web3} = this.state; 
        let _memberAddress = myAccount[_account_id];
        // 블록체인에 date32타입으로 저장되었기 때문에 변환을 거쳐 저장해야 한다. 
        let Ascii_person_id =  web3.utils.fromAscii(_person_id); 
        let Ascii_person_name =  web3.utils.fromAscii(_person_name); 
        // 1 코인당 0.1ether를 충전하기 위한 변환 과정
        let study_make_ether = this.state.study_coin / 10;
        studyGroupInstance.methods.setPersonInfoOfStudy(_study_id, Ascii_person_id, _memberAddress,Ascii_person_name).send(
        {
                from: myAccount[0], // 관리자 계좌
                value: web3.utils.toWei(String(study_make_ether), 'ether'),
                gas: 6000000 
        })
        // receipt 값이 반환되면 트랜잭션의 채굴 완료 된 상태
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('setPersonInfoOfStudy')
            console.log(receipt);
            let transactionReceiptOfMemberItem = receipt;
            this.setState({
                transactionReceiptOfMemberItem:transactionReceiptOfMemberItem
            });
            // 이더 충전 트랜잭션 채굴 완료
            this.setState({
                isMemberItemTransfer: false
            });
        });
    }

    // 수정하기 버튼
    renameStudy = () =>{
        this.props.history.push('/renameStudy/' + this.props.match.params.id);
    }

    // 뒤로가기 버튼
    back = () =>{
        this.props.history.push('/mainPage');
    }
    render() {
        // 로그인, 스터디 가입 여부
        var isJoinBtnShow = {
            display: this.state.joinStudy === 1 ? "none" : "inline"
        };

        // 방장의 study 수정 버튼 가시화
        var isModifyBtnShow = {
            display: this.state.leader === 0 ? "none" : "inline"
        };

        // 방장의 study 삭제 버튼 가시화
        var isDeleteBtnShow = {
            display: this.state.leader === 0 ? "none" : "inline"
        };

        return (
            <div>
                <div className="pageBackgroundColor">
                    {this.state.web3 ?
                        <div style={{marginTop: 10}} className = "studyInfo_container">
                            <div className="studyInfo_left">
                                <div className="studyInfo_header_div">
                                    <span className="studyInfo_header" id="studyInfo_title">{this.state.study_name}</span>
                                    <span className="studyInfo_header"> - </span>
                                    <span className="studyInfo_header" id="studyInfo_kinds">{this.state.study_type}</span>
                                </div>
                                <div className="studyInfo_left_bottom">
                                    <div className="studyInfo_content">
                                        {this.state.study_desc}
                                    </div>
                                    <div className = "studyInfo_list_div">
                                        <ul className="studyInfo_list">
                                            <li>방장 : {this.state.leader_name}</li>  
                                            <li>코인: {this.state.study_coin}</li>
                                            <li>모집 인원 : {this.state.num_people} 명</li>
                                            <li>현재 인원 : {this.state.current_num_people} 명</li>
                                            <li>종료 날짜 : {this.state.study_end_date}</li>
                                        </ul>
                                    </div>
                                </div>
                                {(this.state.isMemberItemTransfer === false)?
                                '':
                                    <div className="progrss_bar_layer"> 
                                        <div className="progress_bar_body">
                                        <ProgressBar message ='스터디 가입 중...' sub_msg1 = '약 1분 정도 소요됩니다.'
                                        sub_msg2 = '잠시만 기다려주세요.'/> 
                                        </div>
                                    </div>
                                } 
                                <div className = "end_date_desc_of_info">★ Study 종료 날짜의 자정에 잔여 코인을<br/> 반환 받을 수 있습니다. ★</div> 
                            
                            </div>
                            <div className="studyInfo_btn">
                                <Link to={'/mainPage'}>
                                    <input type="button" value="뒤로가기" className="btn btn-outline-danger" id="study_info_back" onClick={this.back}/>
                                </Link>
                                <Button color="danger" style = {isJoinBtnShow} onClick={this.toggle} className="btn btn-outline-danger" id="study_info_join">{this.props.buttonLabel} 가입하기 </Button>
                                <input type="button" style = {isModifyBtnShow} value="수정하기" className="btn btn-outline-danger" id="study_info_modify" onClick={this.renameStudy}/>
                                <input type="button" style = {isDeleteBtnShow} value="삭제하기" className="btn btn-outline-danger" id="study_info_delete" onClick={this.studyDeleteConfirm}/>
                            </div>
                            <Modal id = "promptModal" isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                                <ModalHeader toggle={this.toggle}>코인지갑 비밀번호를 입력해주셔야 <br/>코인을 충전할 수 있습니다.</ModalHeader>
                                <ModalBody>
                                        <div>{this.state.study_coin}코인 충전 시 {10000 * this.state.study_coin}원 입니다. (1코인당 10000원)</div>
                                        <br/>
                                        <input type="password" id="input_promptModal"/> 
                                    </ModalBody>
                                <ModalFooter>
                                    <Button id="btn_promptModal" onClick={this.toggle}>확인</Button>{' '}
                                </ModalFooter>
                            </Modal>
                        </div>
                    :  <ProgressBar message ='로딩중'/>}
                    
                </div>
            </div>
        );
    }
}

export default StudyInfo;