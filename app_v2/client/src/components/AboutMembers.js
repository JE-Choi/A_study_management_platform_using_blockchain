import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';
import alert from '../utils/Alert';

class AboutMembers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memberData : null,
            study_name:'',
            study_type:'',
            study_id: '',
            num_people: 0,
            is_study_withdrawal_btn: 0,
            is_start : 0
        }
    }

    componentDidMount = () =>{
        // 스터디 탈퇴(btn) 비가시화
        setTimeout(()=>{
        // 접속한 스터디가 종료된 스터디인지 확인
         this.getMemberOrderbyLeader().then((getMember)=>{
            this.setState({memberData:getMember.data});
            // 접속 사용자의 방장 유무 판단
            for(let i =0; i<getMember.data.length;i++){
                let target_username = getMember.data[0].person_name;
                if(sessionStorage.getItem("loginInfo_userName") === target_username){
                }else{
                    this.setState({
                        is_study_withdrawal_btn: 1
                    });
                }
            }
         });
        // 스터디 정보 불러오기
        this.callLoadApi()
            .then(res => {
            this.setState ({
                study_name: res[0].study_name,
                study_type: res[0].study_type,
                num_people: res[0].num_people,
                is_start: res[0].is_start
            });
        }).catch(err => console.log(err));
        },100);
    }

    // 스터디 정보 불러오기
    callLoadApi = async () => {
    const response = await fetch('/api/studyItems/view/' + sessionStorage.getItem("enterStudyid"));
     const body = await response.json();
        return body;
    }

     // 접속한 스터디가 종료된 스터디인지 확인
     getMemberOrderbyLeader = async () => {
        const url = '/api/community/getMemberOrderbyLeader';

        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid")
        });
    }

    // 스터디 탈퇴하기
    callStudyWithdrawal = async () => {
        const url = '/api/community/studyWithdrawal';

        post(url,  {
            study_id: sessionStorage.getItem("enterStudyid"),
            person_id: sessionStorage.getItem("loginInfo")
        }).then(()=>{
            setTimeout(()=>{
                this.studyWithdrawalConfirm();
            },100);
        });
    }

    // 모집중인 스터디 커뮤니티 안내 메세지
    studyWithdrawalConfirm = () => {
        alert.replaceConfirm('','스터디에서 탈퇴되었습니다.', '/mainPage');
    }

    render() {
        return (
            <div className="main">
                <div className="content">
                    <div className="member_all_div">
                        <div className = "calendarTop_div member_top_div">
                            <span className="calendarTop_name member_top_name">{this.state.study_name}</span>
                            <span className="calendarTop_name"> - </span>
                            <span className="calendarTop_type">{this.state.study_type}</span>
                            <br/>
                            {this.state.is_start === 0?
                            <div className="member_studyDesc_div">
                                <div className="member_studyDesc_num"> (희망 모집인원: {this.state.num_people}명)</div>
                                {this.state.is_study_withdrawal_btn === 1? 
                                    <input type="button" value="탈퇴" 
                                        className="btn btn-outline-primary" 
                                        id="study_withdrawal" 
                                        onClick={this.callStudyWithdrawal}
                                    />
                                : ""}
                            </div>
                            :""}
                        </div>
                    </div>
                    <div className="memberList">
                        <ul className="list-group list-group-horizontal member_list_header">
                            <li className="list-group-item member_list_header_lbl">No</li>
                            <li className="list-group-item member_list_header_lbl">Name</li>
                            <li className="list-group-item member_list_header_lbl">Role</li>
                        </ul>
                        <ul className="list-group member_list_content">
                            { this.state.memberData ? this.state.memberData.map(c => {
                                return (
                                    <MemberItem key = {c.index_num} index = {c.index_num} 
                                    person_name = {c.person_name} leader={c.leader}/>
                                )
                            })
                                : "" }
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

class MemberItem extends Component {
    render() {
        return (
            <div>
                <ul className="list-group list-group-horizontal member_list_each_content">
                    <li className="list-group-item member_content">{this.props.index}</li>
                    <li className="list-group-item member_content">{this.props.person_name}</li>
                    {
                        this.props.leader===1 ? 
                        <li className="list-group-item member_content">팀장</li>: 
                        <li className="list-group-item member_content">팀원</li>
                    }
                </ul>
            </div>
        )
    }
}

export default AboutMembers;