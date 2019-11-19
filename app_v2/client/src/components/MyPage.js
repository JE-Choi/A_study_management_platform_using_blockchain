import React, { Component } from 'react';
import './MyPage.css';
import { post } from 'axios';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import createStudyTransaction from './BlockChain/CreateStudyTransaction';
import initContract from './BlockChain/InitContract';
import ProgressBar from '../utils/ProgressBar/ProgressBar';
import ProgressBarBackGround from '../utils/ProgressBar/ProgressBarBackGround';

class MyPage extends Component{
    constructor(props) { 
        super(props);
        this.state = {
            person_id: '',
            userName: '',
            study_name: '' ,
            study_type: '',
            end_date: '',
            joinStudyArray: '', // 한 사람이 가입한 study 배열
            recruitmenStudyArray: '',
            showStudyListIdx: 0,  // 현재 진행 중과 종료 중인 Study 판별
            showStudyMsg: '종료된 Study 보기' ,
            // progress 
            completed: false
        }
    }

    componentWillMount() {
        // 사용자 이름 session 불러오기
        this.getUserNameSession();
    }

    componentDidMount() {
        $('.progress_layer').hide();
        sessionStorage.setItem("selected_menu", "Schedule");
        initContract.init().then(()=>{
            this.setState({
                completed: true
            });
            // 사용자 이름 session 불러오기
            this.getUserNameSession();
            this.showStudyLists();
        });
    }

    // myPage에서 해당 사용자가 가입한 스터디 불러오기
    callDBStudyInfo = async (_showState) => {
        const url = '/api/myPage/joinStudy';

        post(url,  {
            person_id: sessionStorage.getItem("loginInfo"),
            is_end: _showState
        }).then((res)=>{
            this.setState({
                joinStudyArray: res.data,
                recruitmenStudyArray: ''});
        })
    }

    // myPage에서 모집 중인 스터디 불러오기
    callDBRecruitmentStudyInfo = async () => {
        const url = '/api/myPage/recruitment_JoinStudy';

        post(url,  {
            person_id: sessionStorage.getItem("loginInfo")
        }).then((res)=>{
            this.setState({
                joinStudyArray: '',
                recruitmenStudyArray: res.data});
        })
    }

    // 사용자 이름 session 불러오기
    getUserNameSession = async () =>{
            if (typeof(Storage) !== "undefined") {
                await this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
            } else {
                console.log("Sorry, your browser does not support Web Storage...");
            }
    }

    // 버튼에 따라 현재 가입 중인 Study, 종료된 Study 토글
    showStudyLists = () => {
        // 현재 진행 중인 Study List를 보여주는 경우
        if (this.state.showStudyListIdx === 0) {
            $('.userP_current_study_label').text('현재 진행 중인 Study 보기');
            this.setState ({
                showStudyListIdx: 1,
                showStudyMsg: '종료된 Study'
            })
            this.callDBStudyInfo(false);
        }
        // 종료된 Study List를 보여주는 경우
        else if(this.state.showStudyListIdx === 1){
            $('.userP_current_study_label').text('종료된 Study 보기');
            this.setState ({
                showStudyListIdx: 0,
                showStudyMsg: '현재 가입 중인 Study'
            })
            this.callDBStudyInfo(true);
        }
    }

    // 모집 중인 스터디만 보여줌
    showRecruitmentStudyLists = () =>{
        $('.userP_current_study_label').text('모집 중인 Study 보기');
        this.callDBRecruitmentStudyInfo();
    }

    setReloads(){
        sessionStorage.setItem("selected_menu", "Schedule");
        setTimeout(function() { 
            window.location.reload();
        }, 100);
    }
    
    render() {
        return(
            <div className="main_UserP">
                {this.state.completed === true ?
                <div>
                    <div style={{marginTop: 10}} className = "userP_container">
                        <div className="userP_label">
                            <div className="userP_page_label">{this.state.userName} 님의 Page</div>
                            <div className="userP_current_study_label">
                            </div>
                            <div className="list_toggle_btn_div">
                                <input type="button" onClick = {this.showRecruitmentStudyLists} className="btn btn-outline-primary" id="recruitment_study_list_btn" value='모집 중인 스터디'/>
                                <input type="button" onClick = {this.showStudyLists} className="btn btn-outline-primary" id="end_study_list_btn" value={this.state.showStudyMsg}/>
                            </div>
                        </div>
                        <div className="userP_box">
                            {this.state.joinStudyArray ? this.state.joinStudyArray.map(c => {
                                    return (
                                        <Link to={'/community/' + c.s_id} className="communityMenu" onClick={this.setReloads}>
                                            <JoinMyStudyInfo 
                                                study_name={c.study_name}
                                                study_type={c.study_type}
                                                end_date={c.end_date}
                                            />
                                        </Link>
                                    )
                                })
                            : ""}
                        {this.state.recruitmenStudyArray ? this.state.recruitmenStudyArray.map(c => {
                                return (
                                    <RecruitmentMyStudyInfo 
                                        study_id = {c.s_id}
                                        study_name={c.study_name}
                                        study_type={c.study_type}
                                        end_date={c.end_date}
                                        history = {this.props.history}
                                    />
                                )
                            })
                        : ""}
                        </div>
                    </div>
                </div>
                :
                <ProgressBar message ='로딩중'/>}
                <ProgressBarBackGround message ='스터디 생성 중...' sub_msg1 = "그대로 잠시만 기다려주세요."/>
            </div>
        );
    }
}

class JoinMyStudyInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            end_date_view: ''
        }
    }

    componentDidMount(){
        let end_date = new Date(this.props.end_date);
        let e_year = String(end_date.getFullYear());
        let e_month = String(end_date.getMonth()+1);
        let e_date = String(end_date.getDate());
        let end_date_view = e_year+'년 '+e_month+'월 '+e_date+'일';

        this.setState({
            end_date_view: end_date_view
        });
    }

    render() {
        let end_fullDate = this.props.end_date;
        let end_date = end_fullDate.split('T');

        return (
            <div className="current_study_item">
                <div>
                    <span className="current_study_item_header">{this.props.study_name}</span> - <span>{this.props.study_type}</span>
                </div>
                <span>종료 날짜: {end_date[0]}</span>
            </div>
        )
    }
}

class RecruitmentMyStudyInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            study_start_msg: 'study_start_msg',
            study_start_btn : 'btn btn-outline-primary study_start_btn',
            numOfMember_msg: 'numOfMember_msg',
            study_start_req_msg: 'req_msg',
            end_date_view: '',
            numOfMember: null, // 현재 모집된 인원
            studyData:null,
            personData:null
        }
    }

    componentWillMount(){
        this.setState({
            study_start_msg: this.state.study_start_msg + ' msg_s_' + this.props.study_id,
            study_start_btn: this.state.study_start_btn + ' btn_s_' + this.props.study_id,
            study_start_req_msg : this.state.study_start_req_msg + this.props.study_id,
            numOfMember_msg: this.state.numOfMember_msg + this.props.study_id 
        });
    }

    componentDidMount(){
        $('.msg_s_' + this.props.study_id).hide();
        $('.btn_s_' + this.props.study_id).hide();
        $('.'+this.state.study_start_req_msg).hide();
        $('.'+this.state.numOfMember_msg).hide();
        let end_date = new Date(this.props.end_date);

        let e_year = String(end_date.getFullYear());
        let e_month = String(end_date.getMonth()+1);
        let e_date = String(end_date.getDate());
        let end_date_view = e_year+'년 '+e_month+'월 '+e_date+'일';
    
        this.callDBStudyItemInfo().then((studyData)=>{
            this.callDBStudyJoinInfo().then((personData)=>{
                
                this.setState({
                    studyData:studyData,
                    personData:personData.data,
                    end_date_view: end_date_view
                });

                this.callNumOfMember().then((Member)=>{
                    let numOfMember = Member.data[0].numOfMember;
                    this.setState({
                        numOfMember: numOfMember
                    });
                });
                
                if(personData.data.length > 1){
                    $('.'+this.state.study_start_req_msg).hide();
                    $('.'+this.state.numOfMember_msg).show();
                    for(let i =0 ;i < personData.data.length; i++){
                        if(personData.data[i].leader === 1){
                            if(sessionStorage.getItem("loginInfo") === personData.data[i].person_id){
                                $('.msg_s_' + this.props.study_id).hide();
                                $('.btn_s_' + this.props.study_id).show();
                            } else {
                                $('.msg_s_' + this.props.study_id).show();
                                
                            }   
                        }
                    }
                } else{
                    $('.'+this.state.study_start_req_msg).show();
                }
            });
        });
    }

    // myPage에서 스터디 모집 완료하기(시작하기)
    callStartStudy = async () => {
        const url = '/api/myPage/start_Study';

        post(url,  {
            study_id: this.props.study_id,
            is_start : 1
        });
    }

    // myPage에서 해당 사용자가 가입한 스터디 불러오기
    callDBStudyItemInfo = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.study_id);
        const body = await response.json();
        return body;
    }

    callDBStudyJoinInfo = async () => {
        const url = '/api/select/studyitemAndperson_info/orderByleader';

        return post(url,  {
            study_id: this.props.study_id
        });
    }

    // 해당 스터디에 가입한 스터디 원 수
    callNumOfMember = async () => {
        const url = '/api/myPage/numOfMember';

        return post(url,  {
            study_id: this.props.study_id
        });
    }

    startStudy = async () => {
        $('.progress_layer').show();
        this.callStartStudy();
        createStudyTransaction.startStudy(this.state.studyData, this.state.personData).then((is_end)=>{
            if(is_end === true){
                console.log('스터디 모집 완료');
                $('.progress_layer').hide();
                // this.callStartStudy();
                sessionStorage.setItem("selected_menu", "Schedule");
                setTimeout(()=>{
                    this.props.history.push('/community/' + this.props.study_id);
                },200);
                setTimeout(()=>{
                    window.location.reload();
                },250);
            }
        });
    }

    render() {
        let end_fullDate = this.props.end_date;
        let end_date = end_fullDate.split('T');
        return (
            <div className="current_study_item">
                <Link to={'/recruitment_community/' + this.props.study_id} className="communityMenu_recruitment">
                <div>
                    <span className="current_study_item_header">{this.props.study_name}</span> - <span>{this.props.study_type}</span>
                </div>
                <span>종료 날짜: {end_date[0]}</span>
                </Link>
                <br/>
                <div className = {this.state.numOfMember_msg}>모집된 인원: {this.state.numOfMember} 명</div>
                <div className = {this.state.study_start_msg}>"팀장만 스터디 모집 완료가 가능합니다."</div>
                <div className = {this.state.study_start_req_msg}>"현재 모집된 인원이 2명 이상이 되어야<br/> 스터디 모집 완료가 가능합니다."</div>
                <input type="button" className={this.state.study_start_btn} id='study_start_btn' value='모집 완료하기' onClick={this.startStudy}/>        
            </div>
        )
    }
}

export default MyPage;