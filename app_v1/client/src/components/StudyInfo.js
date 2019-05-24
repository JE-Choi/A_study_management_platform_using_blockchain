import React, { Component } from 'react';
import './StudyInfo.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './PromptModal.css';
import $ from 'jquery';


// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 
import { YearView } from 'react-calendar';


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

            // 스터디 정보 불러올 때 사용
            study_name: '' ,
            study_type: '',
            num_people: '',
            current_num_people: 0,
            study_coin: '',

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
            modal: false
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
            if(account_pw_val == ''){
                this.studyExchenageConfirm();
            } else{
                this.studyJoinConfirm();
            }
        } 
        
      }
    // handleFormSubmit = (e) => {
    //     // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
    //     e.preventDefault(); 
    
    //     this.callJoinApi().then((response) => {
    //         console.log(response.data);
    //     });
    // }

    componentDidMount() {
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
            if(sessionStorage.getItem("loginInfo") == null){  
                this.setState({joinStudy: 1});
            }else{
                this.joinStudy();
            }
        }, 50);        
    }

    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id: sessionStorage.getItem("loginInfo")});
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

        const url = '/api/studyItems/join/' + this.props.match.params.id;
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id,
            leader: false,
            // account_number: '11-22'
        }).then(()=>{
            this.createAccount(this.props.match.params.id).then((account_id)=>{
                this.chargeTheCoin(account_id);
                setTimeout(()=>{
                    this.studyOkJoinConfirm();
                },100);
                this.props.history.push('/mainPage');
            });
        })
    }

    callCurrentPeopleApi = () => {
        const url = '/api/studyItems/view_currentPeople';

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

    studyExchenageConfirm = () => {

        setTimeout(()=>{
            confirmAlert({
                title: '패스워드를 입력해주세요.',
                // message: this.state.study_coin+'코인 충전 시 '+ (5000*this.state.study_coin)+'원 입니다.(1코인당 5000원)',
                buttons: [
                  {
                      label: '네',
                    //   onClick: () => this.handleFormOkSubmit()
                  },
                //   {
                //       label: '아니요',
                //       onClick: () => alert('아니오')
                //   }
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
    }

    createAccount = async (_study_id) =>{
        const {myAccount, web3} = this.state; 
       
        // (예정) 계정 생성 전에 DB에 접근하여 중복되는 비밀번호 있는지 검사하고나서, 중복되는 게 없는 경우에만 회원가입 진행
        
        // 계정 생성 
        //var account_pw = this.state.account_pw;
        //let account_pw = prompt("코인지갑 비밀번호를 입력해주세요.");
        await web3.eth.personal.newAccount(this.state.account_pw);
        console.log('사용된 패스워드: ' + this.state.account_pw);
        // 계좌가 생성되었기 때문에 계좌목록 State값 갱신해야 한다. 
        let myAccount_new = await web3.eth.getAccounts();
        this.setState({
            myAccount: myAccount_new
        });

        // 바로 setState한거 적용 안되기 때문에 state값 안 가져다 사용.
        var account_id =  myAccount_new.length - 1;
        console.log(account_id);
    
        // DB 저장 시 계정 index값과 비밀번호, hash계정 값 저장해야함.
        var account_num = myAccount_new[account_id];
        console.log('['+(account_id)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났고, 비밀번호는 ' + this.state.account_pw);
    
        
        // DB에 값 삽입
        this.callCreateAccountApi(this.state.person_id, account_id, account_num, this.state.account_pw,_study_id).then((response) => {
            //console.log(response.data);
            console.log(this.state.person_id +' '+account_id+' '+account_num+' '+this.state.account_pw);
        }).catch((error)=>{
        console.log(error);
        });

        return account_id;
        // this.createTheStudy(0,account_num, 'person', 1, 40);
    }

    callCreateAccountApi = (_person_id,_account_id,_account_num,_account_pw,_study_id) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_id: _account_id,
            account_num: _account_num,
            account_pw: _account_pw,
            study_id: _study_id
        });
    }

    chargeTheCoin = async (_account_id) =>{
        const { studyGroupInstance, myAccount, web3} = this.state; 

        let study_make_coin = this.state.study_coin;
        // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
        studyGroupInstance.methods.chargeTheCoin(myAccount[_account_id]).send(
            {
                from: myAccount[0], 
                value: web3.utils.toWei(String(study_make_coin), 'ether'),
                // gasLimit 오류 안나서 일단은 gas:0 으로 했지만 오류 나면 3000000로 바꾸기
                gas: 0 
            }
        );

        setTimeout(function(){
            web3.eth.getBalance(myAccount[_account_id]).then(result=>{
                console.log('이체 후 잔액은: ' + web3.utils.fromWei(result, 'ether'));
            });
        }, 1000);
    }

    componentWillMount = async () => {
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
          console.log(web3);
          console.log(myAccount);

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

    render() {
        
        // 로그인, 스터디 가입 여부
        var isJoinBtnShow = {
            display: this.state.joinStudy == 1 ? "none" : "inline"
        };

        // 방장의 study 수정 버튼 가시화
        var isModifyBtnShow = {
            display: this.state.leader == 0 ? "none" : "inline"
        };

        // 방장의 study 삭제 버튼 가시화
        var isDeleteBtnShow = {
            display: this.state.leader == 0 ? "none" : "inline"
        };

        return (
            <div>
                <div className="main_studyInfo">
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
                        </div>
                        <div className="studyInfo_btn">
                            <Link to={'/mainPage'}>
                                <input type="button" value="뒤로가기" className="btn btn-danger" id="study_info_back"/>
                            </Link>
                            <Button color="danger" style = {isJoinBtnShow} onClick={this.toggle} id="study_info_join">{this.props.buttonLabel} 가입하기 </Button>
                            <Link to={'/renameStudy/' + this.props.match.params.id}>
                                <input type="button" style = {isModifyBtnShow} value="수정하기" className="btn btn-danger" id="study_info_modify"/>
                            </Link>
                            <Link to={'/mainPage'}>
                                <input type="button" style = {isDeleteBtnShow} value="삭제하기" className="btn btn-danger" id="study_info_delete" onClick={(e) => {this.deleteCustomer(this.props.match.params.id)}}/>
                            </Link>
                        </div>
                        <Modal id = "promptModal" isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                            <ModalHeader toggle={this.toggle}>코인지갑 비밀번호를 입력해주셔야 <br/>코인을 충전할 수 있습니다.</ModalHeader>
                            <ModalBody>
                                    <div>{this.state.study_coin}코인 충전 시 {5000 * this.state.study_coin}원 입니다. (1코인당 5000원)</div>
                                    <br/>
                                    <input type="password" id="input_promptModal"/> 
                                </ModalBody>
                            <ModalFooter>
                                <Button id="btn_promptModal" onClick={this.toggle}>확인</Button>{' '}
                            </ModalFooter>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}

export default StudyInfo;