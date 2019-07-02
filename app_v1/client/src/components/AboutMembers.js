import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';

class AboutMembers extends Component {

    constructor(props) {
        super(props);
        this.state = {
            memberData : null,
            study_name:'',
            study_type:'',
            end_date:''
        }
    }

    componentDidMount = () =>{
         this.getMemberOrderbyLeader().then((getMember)=>{
            this.setState({memberData:getMember.data});
         });
        this.callLoadApi(sessionStorage.getItem("enterStudyid"))
            .then(res => {

            let test_date = res[0].end_date;
            let date = test_date.split('-');
            let day = date[2].split('T');
            let date_str = date[0]+'년 '+date[1]+'월 '+day[0]+'일';

            this.setState ({
                study_name: res[0].study_name,
                study_type: res[0].study_type,
                end_date: date_str
            });
        }).catch(err => console.log(err));
    }

    callLoadApi = async (id) => {
        const response = await fetch('/api/studyItems/view/' + id);
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

    render() {
        return (
            <div className="main">
                <div className="content">
                    <div>
                        <div className = "calendarTop_div">
                            <span className="calendarTop_name">{this.state.study_name}</span>
                            <span className="calendarTop_name"> - </span>
                            <span className="calendarTop_name">{this.state.study_type}</span>
                            <br/>
                            <span className="calendarTop_study_period">종료날짜: {this.state.end_date}</span>
                        </div>
                    </div>
                    <table className="table memberTable">
                        <thead className="memberTableHeader">
                            <tr>
                            <th scope="col">No</th>
                            <th scope="col">이름</th>
                            <th scope="col">Role</th>
                            </tr>
                        </thead>
                        <tbody className="memberTableBody">
                            { this.state.memberData ? this.state.memberData.map(c => {
                                return (
                                    <MemberItem key = {c.index_num} index = {c.index_num} 
                                    person_name = {c.person_name} leader={c.leader}/>
                                )
                            })
                                : "" }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

class MemberItem extends Component {
    render() {
        return (
            <tr >
                <td>{this.props.index}</td>
                <td>{this.props.person_name}</td>
                {this.props.leader==1?
                <td>팀장</td>:
                <td>팀원</td>}
            </tr>
        )
    }
}

export default AboutMembers;