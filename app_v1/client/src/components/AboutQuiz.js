import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';
import $ from 'jquery';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';

class AboutQuiz extends Component {

    componentWillMount= async () => {
        // 퀴즈 화면 메뉴를 누른 경우, 나타나는 확인 문구
        this.quizCautionConfirm();
   }

    // 퀴즈 화면 메뉴를 누른 경우, 나타나는 확인 문구
    quizCautionConfirm = () => {
        confirmAlert({
            message: '퀴즈 점수로 순위를 매긴 후, 자신을 제외한 스터디 원들에게 벌금으로 코인을 자동 지불하게 됩니다.',
            buttons: [
            {
                label: '확인'
            }
            ]
        })        
    }

    render() {
        return (
            <Router>
                <div className="main">
                    <div className="content">
                        <div className="div_quiz_score">
                            <div className="quiz_header">퀴즈 점수</div>
                            <Switch>
                                <Route exact path='/community/:id/aboutQuiz/quizResult' component = { QuizResult } />
                                <Route exact path='/community/:id/aboutQuiz' component = { QuizInputScore } />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        )
    }
}

class QuizInputScore extends Component {

    constructor(props) {
        super(props);
        this.state = {
            study_id: '', // 스터디 id
            userNameArray: '', // 스터디 원 이름 배열
            user_score: 0, // 퀴즈 점수
            quiz_date: '', // 퀴즈 날짜
            quiz_month: 0, // 퀴즈 날짜 월
            quiz_day: 0, // 퀴즈 날짜 일
            is_quiz_message: 0 // 퀴즈 설명 화면 유무
        }
    }

    componentDidMount= async () => {
        // 스터디 이름 session 불러오기
        this.getStudyIdSession().then(()=>{
            // DB에서 해당 스터디 최근 날짜 불러오기
            this.getQuizDate().then((res)=>{
                if (res.data.length !== 0) {
                    this.makeAttendDateList(res.data).then((result)=>{
                        // 스터디 최근 날짜
                        var study_recent_date = result;

                        this.setState ({
                            quiz_date: study_recent_date
                        });

                        let quiz_date = new Date(this.state.quiz_date+' 00:00:00');
                        this.setState ({
                            quiz_month: quiz_date.getMonth()+1,
                            quiz_day: quiz_date.getDate()
                        });
                        
                        this.getQuizResult().then((resInfo)=>{
                            if(resInfo.data.length === 0){
                                // 스터디에 있는 스터디원 이름 불러오기
                                this.getPersonName().then((res)=>{

                                    // let name_array = new Array();
                                    let name_array = [];
                                    for(let i = 0; i < res.data.length; i++){
                                        name_array.push(res.data[i]);
                                    }
                                    this.setState({
                                        userNameArray : name_array
                                    });
                                });
                            }
                            else {
                                this.props.history.push('/community/'+this.state.study_id+'/aboutQuiz/quizResult');
                            }
                        });
                    });
                } 
                // 해당 스터디에 한 번도 출석체크 결과 없는 경우 
                else{
                    this.setState({
                        is_quiz_message: 1
                    });
                }
            });
        });
    }

    // 퀴즈 점수 모두 입력 유도 
    quizScoreConfirm = () => {
        confirmAlert({
            message: '각 스터디 원들의 점수를 모두 입력해주세요.',
            buttons: [
            {
                label: '확인'
            }
            ]
        })        
    }

    // 스터디 이름 session 불러오기
    getStudyIdSession = async () =>{
        if (typeof(Storage) !== "undefined") {
            await this.setState({study_id : sessionStorage.getItem("enterStudyid")});
        } 
        else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // 퀴즈 점수 입력 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();

        // DB에 퀴즈 점수 저장
        let userNameArray = this.state.userNameArray;
        let is_input_score = 0;

        for (let i=0; i<userNameArray.length; i++){
            let person_name = userNameArray[i].person_name;
            let classname = '.score_'+person_name;
            let score = $(classname).val();

            if(score !== ''){
                is_input_score++;
            }
        }

        // 해시 함수를 이용한 퀴즈 점수 동점자 처리
        let hashScoreArray = this.sameScoreProcess(userNameArray);

        // 모든 사람이 점수를 입력한 경우
        if(is_input_score === userNameArray.length){
            for(let i=0; i<hashScoreArray.length; i++){
                let person_name = hashScoreArray[i][0];
                let score = hashScoreArray[i][1];
                let rank = hashScoreArray[i][2];

                this.setQuizScore(person_name, score, rank);
            }
            this.props.history.push('/community/'+this.state.study_id+'/aboutQuiz/quizResult');
        } 
        // 모든 사람이 점수를 입력하지 않은 경우
        else{
            this.quizScoreConfirm();
        }
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    } 

    // 해시 함수를 이용한 퀴즈 점수 동점자 처리
    sameScoreProcess = (userNameArray) => {
        let scoreArray = []; // 퀴즈 점수 배열 생성
        let hashScoreArray = []; // 퀴즈 동점자 해시 배열 생성 
        let quiz_info_array = []; // 등수 관리 배열

        // hashScoreArray는 2차원 배열
        // 1차: 점수 배열, 2차: 점수에 해당하는 이름 배열
        // hashScoreArray[score_key] = [person_name 배열];
        for(let a=0; a < userNameArray.length; a++) {
            let score = $('.score_'+userNameArray[a].person_name).val();
            scoreArray.push(score);

            if(hashScoreArray[score] === undefined) {
                // 동점자 저장하는 배열 생성
                hashScoreArray[score] = [];
                // 값 삽입
                hashScoreArray[score].push(userNameArray[a].person_name);
            }
            // 동점자 저장하는 배열있을 경우 값 삽입 
            else{
                hashScoreArray[score].push(userNameArray[a].person_name);
            }
        }
        scoreArray = scoreArray.sort((a,b) =>  b - a);
    
        // 등수 설정
        let rank = 1;
        for(let i=0; i < scoreArray.length; i++){
            let score_key = scoreArray[i];
            
            let same_person_name_list = hashScoreArray[score_key];
            if(i > 0){
                let beforeInfo_score = scoreArray[i-1];
                if(beforeInfo_score !== score_key){
                    rank++;
                    for(let  a=0; a < same_person_name_list.length ; a++){
                        // 이름에 대한 정보 (이름, 점수, 등수)
                        let quiz_info_sub_array = [];
                        quiz_info_sub_array.push(same_person_name_list[a], score_key, rank);
                        quiz_info_array.push(quiz_info_sub_array);
                    }
                }
            } 
            else if(i === 0){
                for(let  a=0; a < same_person_name_list.length ; a++){
                    // 이름에 대한 정보 (이름, 점수, 등수)
                    let quiz_info_sub_array = [];
                    quiz_info_sub_array.push(same_person_name_list[a], score_key, rank);
                    quiz_info_array.push(quiz_info_sub_array);
                }
            }
        }
        return quiz_info_array;
    }

    // DB에 퀴즈 점수 저장
    setQuizScore = async(userName, user_score,rank)=>{
        const url = '/api/quiz/setQuizScore';
        
        return post(url, {
            study_id : this.state.study_id,
            userName : userName,
            quiz_date : this.state.quiz_date,
            user_score : user_score,
            rank: rank
        }); 
    }

    // DB에서 해당 스터디 최근 날짜 불러오기
    getQuizDate = async()=>{
        const url = '/api/quiz/getQuizDate';
        
        return post(url, {
            study_id : this.state.study_id 
        }); 
    }

    // 스터디에 있는 스터디원 이름 불러오기
    getPersonName = async()=>{
        const url = '/api/quiz/getNames';
        
        return post(url, {
            study_id : this.state.study_id,
            quiz_date : this.state.quiz_date
        }); 
    } 

    // 퀴즈 기록 여부 확인
    getQuizResult = async () =>{
        const url = '/api/quiz/getQuizResult';
        
        return post(url, {
            study_id : this.state.study_id,
            quiz_date : this.state.quiz_date
        }); 
    }

    // 출석체크한 날짜 정렬하기
    makeAttendDateList = async(received_date) =>{
        // 정렬 사용하기
        let date_array = [];
        for(let i=0; i < received_date.length; i++){
            let date = received_date[i].attendance_start_date;
            let d_date = new Date(date + ' 00:00:00');
            date_array.push(d_date);
        }

        // 내림차순
        date_array = date_array.sort(function(a, b) { 
            return b - a;
        });
  
        let start_date = date_array[0].getFullYear()+'-'+(date_array[0].getMonth()+1)+'-'+date_array[0].getDate();
        return start_date;
    }
    
    render() {
        return(
            <div className="quiz_content">
                {this.state.is_quiz_message === 1 ? 
                    <div className="out_frame_not_exist_quiz">
                        <div className="page_desc_div">
                            <span className="emphasis_letter_first">스터디 미팅</span><span>을 가진 후, </span>
                            <span className="emphasis_letter_next">퀴즈를 볼 수 있습니다.</span>
                        </div>
                        <br />
                        <span className="emphasis_letter">퀴즈 점수</span>를 입력하려면 
                        <br />
                        <span className="emphasis_letter">'출석 체크' 메뉴에서 출석을 먼저 해주세요.</span>
                        <br />
                        <br />
                        <span className="emphasis_letter">퀴즈 점수의 등수에 따라 코인 거래</span>가 이루어집니다.
                        <br />
                        <br />
                        열심히 공부하여 좋은 성과를 이루기를 바랍니다.
                    </div> 
                    :
                    <div>
                        <div>
                            <span className="quiz_today_header">{this.state.quiz_month}월 {this.state.quiz_day}일 퀴즈 점수 입력</span>
                        </div>   
                        <div className="quiz_status_control">
                            <form onSubmit={this.handleFormSubmit}>
                                <div className="quiz_form_group">
                                    { this.state.userNameArray ? this.state.userNameArray.map(c => {
                                        return (
                                            <NameItem
                                                person_name = {c.person_name}
                                                className = {c.person_name}
                                            />
                                        )
                                        })
                                    : "" }
                                    <div className="btn_div">
                                        <button type="submit" className="btn btn-outline-danger btn-lg btn-block " id="btn_quiz_score_input">점수 입력</button>
                                    </div>
                                </div>
                            </form>
                        </div> 
                    </div>
                }
            </div>
        );
    }
}

class NameItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            className: 'form-control'
        }
    }
    
    componentWillMount(){
        this.setState({
            className: this.state.className +' score_'+this.props.className
        });
    }

    render() {
        return(
            <div>
                <div className="each_quiz_point">
                    <label className="quiz_name_label">{this.props.person_name}</label>
                    <span className="dotdot">:</span>
                    <input type="number" min="0" max="100" placeholder="0" className={this.state.className} id="quiz_score" name="quiz_score" />
                </div>
                <div className = "clear_quiz"></div>
            </div>
        );
    }
}

// 최종 결과 화면
class QuizResult extends Component {

    constructor(props) {
        super(props);
        this.state = {
            study_id: '', // 스터디 id
            quiz_info_array: '', // 스터디 원 퀴즈 결과 정보
            user_score: 0, // 퀴즈 점수
            quiz_date: '', // 퀴즈 날짜
            quiz_month: 0, // 퀴즈 날짜 월
            quiz_day: 0, // 퀴즈 날짜 일
            is_no_past_quiz_result: 0 // 과거 퀴즈 점수가 존재하지 않는다는 설명 화면 유무
        }
    }

    componentDidMount= async () => {
        // 사용자 이름 session 불러오기
        this.getStudyIdSession().then(()=>{
            // DB에서 해당 스터디 최근 날짜 불러오기
            this.getQuizDate().then((res)=>{
                if (res.data.length !== 0) {
                    this.makeAttendDateList(res.data).then((result)=>{
                        // 스터디 최근 날짜
                        var study_recent_date = result;

                        this.setState ({
                            quiz_date: study_recent_date
                        });

                        let quiz_date = new Date(this.state.quiz_date+' 00:00:00');

                        this.setState ({
                            quiz_month: quiz_date.getMonth()+1,
                            quiz_day: quiz_date.getDate()
                        });

                        // 스터디에 있는 스터디 원 이름 및 점수 불러오기
                        this.getPersonName().then((res)=>{
                            this.getScoreOfThePerson();
                        });
                    });
                }
            });
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 퀴즈 점수 등록 여부 확인
    isQuizResult = async()=>{
        const url = '/api/quiz/isQuizResult';
        
        return post(url, {
            study_id : this.state.study_id ,
            quiz_date : this.state.quiz_date
        }); 
    }

    // DB에서 스터디 원의 점수 불러오기
    getQuizResult = async () =>{
        const url = '/api/quiz/getQuizResult';
        
        return post(url, {
            study_id : this.state.study_id,
            quiz_date : this.state.quiz_date
        }); 
    }

    // 사용자 이름 session 불러오기
    getStudyIdSession = async () =>{
        if (typeof(Storage) !== "undefined") {
            await this.setState({study_id : sessionStorage.getItem("enterStudyid")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // DB에서 해당 스터디 최근 날짜 불러오기
    getQuizDate = async()=>{
        const url = '/api/quiz/getQuizDate';
        
        return post(url, {
            study_id : this.state.study_id 
        }); 
    }

    // 스터디에 있는 스터디원 이름 불러오기
    getPersonName = async()=>{
        const url = '/api/quiz/getNames';
        
        return post(url, {
            study_id : this.state.study_id
        }); 
    } 

    // 각 스터디 원의 퀴즈 점수 불러오기
    getScoreOfThePerson = async()=>{
      
        let hashScoreArray;
        this.getQuizResult().then((res)=>{
            if(res.data.length !== 0){
                
                hashScoreArray = res.data;
            }

            this.setState({
                quiz_info_array: hashScoreArray
            });
        });
    }

    // 출석체크한 날짜 정렬하기
    makeAttendDateList = async(received_date) =>{
        // 정렬 사용하기
        let date_array = [];
        for(let i=0; i < received_date.length; i++){
            let date = received_date[i].attendance_start_date;
            let d_date = new Date(date + ' 00:00:00');
            date_array.push(d_date);
        }

        // 내림차순
        date_array = date_array.sort(function(a, b) { 
            return b - a;
        });

        for(let i = 0; i < date_array.length; i++){
            let start_date = date_array[i].getFullYear()+'-'+(date_array[i].getMonth()+1)+'-'+date_array[i].getDate();
            $("#quiz_date_selected").append('<option>'+start_date+'</option>');
        }
        let start_date = date_array[0].getFullYear()+'-'+(date_array[0].getMonth()+1)+'-'+date_array[0].getDate();
        return start_date;
    }

    // 리스트에서 날짜 선택 후 점수 확인하는 버튼
    confirmResultOfTheDate = async() =>{
        // 퀴즈 점수 등록 여부 확인
        this.isQuizResult().then((res)=>{

            // 해당 날짜에 퀴즈 점수가 등록되지 않은 경우
            if (res.data.length === 0) {
                this.setState({
                    is_no_past_quiz_result: 1
                })                   
            } else{
                this.setState({
                    is_no_past_quiz_result: 0
                })   
                this.getScoreOfThePerson();
            }
        })
        
    }

    render() {
        return(
            <div className="quiz_content">
                <div className="quiz_result_header">
                    <span id = "quiz_result_label">퀴즈 결과</span>
                    <select className="form-control" id="quiz_date_selected" name='quiz_date' value={this.state.quiz_date} onChange={this.handleValueChange}>
                    </select>
                    <input type="button" onClick = {this.confirmResultOfTheDate} className="btn btn-outline-danger btn-lg btn-block" id="moveBtn_select_quiz_date" value="확인"/>
                </div>
                <div className="quiz_status_control">
                {this.state.is_no_past_quiz_result === 0 ? 
                    <div className="quiz_form_group">
                        { this.state.quiz_info_array ? this.state.quiz_info_array.map(c => {
                            return (
                                <ResultItem 
                                    person_name = {c.person_name}
                                    score = {c.score}
                                    rank = {c.score_rank}
                                />
                            )
                            })
                            : "" }
                    </div> 
                    : 
                    <div className="no_quiz_result_past">
                        퀴즈 점수를 입력하지 않아서
                        <br />
                        퀴즈 결과가 존재하지 않습니다.
                    </div>
                } 
                </div>    
            </div>
        );
    }
}

class ResultItem extends Component {

    render() {
        return(
            <div>
                <div className="each_quiz_result_point">
                    <label className="quiz_result_name_label">{this.props.person_name}</label>
                    <span className="result_dotdot">:</span>
                    <input type="number" min="0" max="100" placeholder="0" className="form-control" id="result_score" name="result_score" value = {this.props.score} onChange={this.handleValueChange} disabled/>
                    <span>점</span>
                    <span className="quiz_rank">{this.props.rank}등</span>
                </div>
                <div className = "clear_quiz"></div>
            </div>
        );
    }
}

export default AboutQuiz;

