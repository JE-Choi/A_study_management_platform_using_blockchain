import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';
import { BrowserRouter as Link } from 'react-router-dom';
import './PromptModal.css';
import alert from '../utils/Alert';

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
            study_cnt: ''
        }
    }
    
    componentDidMount() {
        this.callApi()
        .then(res => {
                let start_date = new Date(res[0].start_date);
                let end_date = res[0].end_date.split('T');
            
                let s_year = String(start_date.getFullYear());
                let s_month = String(start_date.getMonth()+1);
                let s_date = String(start_date.getDate());

                let view_start_date = s_year+'-'+s_month+'-'+s_date;
 
                this.setState({study_item_info: res});
                this.setState ({
                    study_name: res[0].study_name ,
                    study_type: res[0].study_type,
                    num_people: res[0].num_people,
                    study_start_date: view_start_date,
                    study_end_date: end_date[0],
                    study_coin: res[0].study_coin,
                    study_desc: res[0].study_desc,
                    study_cnt: res[0].study_cnt
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
            leader: false
        });
        setTimeout(()=>{
            this.studyOkJoinConfirm();
        },100);
        this.props.history.push('/mainPage');
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
        alert.confirm('','스터디가 삭제되었습니다.');
    };


    handleFormOkSubmit(){
        this.callJoinApi();
    }

    // 스터디 가입 완료 확인창
    studyOkJoinConfirm = () => {
        alert.confirm('스터디에 가입되었습니다.', '자세한 사항은 MyPage에서 확인할 수 있습니다.');
    }

    // 스터디 가입 취소 확인창
    studyNoJoinConfirm = () => {
        alert.confirm('','스터디 가입이 취소되었습니다.');
    }

    // 스터디 가입 취소 확인 메소드를 호출하는 메소드
    studyNoJoinConfirmOK = () => {
        setTimeout(()=>{
            this.studyNoJoinConfirm();
        },100);
    }

    // 스터디 가입했는지 확인 쿼리
    joinStudy = async() =>{
        const url = '/api/isCheckJoinAndLeader';
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id
        }).then((result)=>{
            // 모집 인원이 다 모이면, 가입 버튼 비가시화.
            if (this.state.current_num_people < this.state.num_people) {
                this.setState({joinStudy:result.data.length});
            }

            setTimeout(() => {
                if(result.data.length === 1) {
                    this.isStudyLeader(result.data[0].leader);
                } else{
                    this.isStudyLeader(0);
                }
            }, 100);
        });
    }

    // 해당 study의 방장인지 확인
    isStudyLeader = (_leader) =>{
        this.setState({leader:_leader});
    }

    // 방장이 study 삭제하는 메소드
    deleteCustomer(_id) {
        const url = '/api/delete/studyitem/' + _id;

        fetch(url, {
            method: 'DELETE'
        }).catch(err => console.log(err));
         setTimeout(() => {
            this.studyDeleteAlert();
            this.props.history.push('/mainPage');
        }, 500);   
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
        // 모집 인원이 다 모인 경우 가입 버튼 보이지 않게 함.
        var isJoinBtnShow = {
            display: this.state.joinStudy === 1 ? "none" : "inline"
        };

        return (
            <div>
                <div className="pageBackgroundColor">
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
                                        <li>가입 Ether: {this.state.study_coin}</li>
                                        <li>모집 인원 : {this.state.num_people} 명</li>
                                        <li>현재 인원 : {this.state.current_num_people} 명</li>
                                        <li>종료 날짜 : {this.state.study_end_date}</li>
                                        <li>스터디 총 횟수 : {this.state.study_cnt} 회</li>
                                    </ul>
                                </div>
                            </div>
                            <div className = "end_date_desc_of_info">
                                ★ 종료 날짜의 다음 날 또는 횟수가 충족되면
                                <br /> 잔여 Ether를 반환 받을 수 있습니다. ★
                            </div>
                        </div>
                        <div className="studyInfo_btn">
                            <Link to={'/mainPage'}>
                                <input type="button" value="뒤로가기" className="btn btn-outline-primary" id="study_info_back" onClick={this.back}/>
                            </Link>
                            <input type="button" style = {isJoinBtnShow} onClick={this.studyJoinConfirm} className="btn btn-outline-primary" id="study_info_join" value ='가입하기'/>
                            {this.state.leader !== 0 ?
                            <span>
                                <input type="button" value="수정하기" className="btn btn-outline-primary" id="study_info_modify" onClick={this.renameStudy}/>
                                <input type="button" value="삭제하기" className="btn btn-outline-primary" id="study_info_delete" onClick={this.studyDeleteConfirm}/>
                            </span>:""}    
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StudyInfo;