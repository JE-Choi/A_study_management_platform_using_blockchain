import React, { Component } from 'react';
import './StudyInfo.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

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
            current_num_people: '',
            study_coin: '',
            study_period: '',
            study_desc: ''
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
              //this.setState({study_item_info: res});
              this.setState ({
                study_name: res[0].study_name ,
                study_type: res[0].study_type,
                num_people: res[0].num_people,
                current_num_people: res[0].current_num_people,
                study_period: res[0].study_period,
                study_coin: res[0].study_coin,
                study_desc: res[0].study_desc
            })

        }).catch(err => console.log(err));

        this.callLeaderApi().then(res => {
            this.setState ({
                leader_name: res[0].person_name
            })
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
        const response = await fetch('/api/customers/view/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callLeaderApi = async () => {
        const response = await fetch('/api/customers/view_leader/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callJoinApi = () => {
        const url = '/api/customers/join/' + this.props.match.params.id;
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id,
            leader: false,
            account_number: '11-22'
        }).then(()=>{
            this.props.history.push('/mainPage');
        })

        setTimeout(()=>{
            this.studyOkJoinConfirm();
        },100);
    }

    // 스터디 가입 확인창
    studyJoinConfirm = () => {
        confirmAlert({
          title: '스터디 가입',
          message: '스터디를 가입하시겠습니까?',
          buttons: [
            {
                label: '네',
                onClick: () => this.callJoinApi()
            },
            {
                label: '아니요',
                onClick: () => this.studyNoJoinConfirmOK()
            }
          ]
        })
    };

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
        const url = '/api/isjoin';
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id
        }).then((result)=>{
            this.setState({joinStudy:result.data.length});
        });
    }

    render() {

        // 로그인, 스터디 가입 여부
        var isJoinBtnShow = {
            display: this.state.joinStudy == 1 ? "none" : "inline"
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
                                        <li>모집 인원 : {this.state.num_people}</li>
                                        <li>현재 인원 : {this.state.current_num_people}</li>
                                        <li>Study 기간 : {this.state.study_period} 주</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="studyInfo_btn">
                            <Link to={'/mainPage'}>
                                <input type="button" value="뒤로가기" className="btn btn-danger" id="study_info_back"/>
                            </Link>
                            <input type="button" style = {isJoinBtnShow} value="가입하기" className="btn btn-danger" id="study_info_join" name='study_info_join' onClick={this.studyJoinConfirm} />
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default StudyInfo;