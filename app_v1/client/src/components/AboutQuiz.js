import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';
import $ from 'jquery';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class AboutQuiz extends Component {
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
            quiz_day: 0 // 퀴즈 날짜 일
        }
    }

    componentDidMount= async () => {
        this.getStudyIdSession().then(()=>{

            this.getQuizDate().then((res)=>{

                if (res.data.length !== 0) {
                    // 스터디 최근 날짜
                    var study_recent_date = res.data[0].attendance_start_date;

                    this.setState ({
                        quiz_date: study_recent_date
                    });

                    let quiz_date = new Date(this.state.quiz_date+' 00:00:00');

                    this.setState ({
                        quiz_month: quiz_date.getMonth()+1,
                        quiz_day: quiz_date.getDate()
                    });

                    this.getQuizInfo().then((resInfo)=>{
                        console.log(resInfo.data.length );
                        if(resInfo.data.length === 0){
                            // DB에서 해당 스터디 최근 날짜 불러오기
                            // 스터디에 있는 스터디원 이름 불러오기
                            this.getPersonName().then((res)=>{

                                let name_array = new Array();
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
                   
                }
            });
            
        });
    }

    // 스터디 이름 session 불러오기
    getStudyIdSession = async () =>{
        if (typeof(Storage) !== "undefined") {
            await this.setState({study_id : sessionStorage.getItem("enterStudyid")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // 출석 시간 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();

        // DB에 퀴즈 점수 저장
        let userNameArray = this.state.userNameArray;

        for(let i=0; i<userNameArray.length; i++){

            console.log(userNameArray[i].person_name);
            let person_name = userNameArray[i].person_name;
            let classname = '.score_'+person_name;
            let score = $(classname).val();

            this.setQuizScore(person_name, score).then((res)=>{
                console.log(res);
            });
        }
        this.props.history.push('/community/'+this.state.study_id+'/aboutQuiz/quizResult');
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    } 

    // DB에 퀴즈 점수 저장
    setQuizScore = async(userName, user_score)=>{
        const url = '/api/quiz/setQuizScore';
        
        return post(url, {
            study_id : this.state.study_id,
            userName : userName,
            quiz_date : this.state.quiz_date,
            user_score : user_score
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
            study_id : this.state.study_id
        }); 
    } 

    // 퀴즈 기록 여부 확인
    getQuizInfo = async () =>{
        const url = '/api/quiz/getQuizInfo';
        
        return post(url, {
            study_id : this.state.study_id,
            quiz_date : this.state.quiz_date
        }); 
    }
    
    render() {
        return(
            <div className="quiz_content">
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
                    <input type="number" min="0" max="100" placeholder="0" className={this.state.className} id="quiz_score" name="quiz_score" onChange={this.handleValueChange} />
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
            quiz_day: 0 // 퀴즈 날짜 일
        }
    }

    componentDidMount= async () => {

        this.getStudyIdSession().then(()=>{
            // DB에서 해당 스터디 최근 날짜 불러오기
            this.getQuizDate().then((res)=>{

                if (res.data.length !== 0) {
                    // 스터디 최근 날짜
                    var study_recent_date = res.data[0].attendance_start_date;

                    this.setState ({
                        quiz_date: study_recent_date
                    });

                    let quiz_date = new Date(this.state.quiz_date+' 00:00:00');

                    this.setState ({
                        quiz_month: quiz_date.getMonth()+1,
                        quiz_day: quiz_date.getDate()
                    });

                    // 스터디에 있는 스터디 원 이름 불러오기
                    this.getPersonName().then((res)=>{
                        
                        let quiz_info_array = new Array();

                        // 스터디 원의 퀴즈 점수 불러오기
                        this.getQuizInfo().then((res)=>{
                            if(res.data.length !== 0){
                                for(let i = 0; i < res.data.length; i++){

                                    let quiz_info_sub_array = new Array();
                                    let person_name = res.data[i].person_name;
                                    let score = res.data[i].score;
                                    let rank = i + 1;
                                    quiz_info_sub_array.push(person_name, score, rank);
                                    quiz_info_array.push(quiz_info_sub_array);
                                }
                            }

                            this.setState({
                                quiz_info_array: quiz_info_array
                            });
                        });
                    });
                }
            });
        });
    }

    // DB에서 스터디 원의 점수 불러오기
    getQuizInfo = async () =>{
        const url = '/api/quiz/getQuizInfo';
        
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
    
    render() {
        return(
            <div className="quiz_content">
                <div>
                    <span className="quiz_today_header">{this.state.quiz_month}월 {this.state.quiz_day}일 퀴즈 결과</span>
                    {/* <span><pre className="quiz_today_header">{this.state.quiz_month}월 {this.state.quiz_day}일  퀴즈  결과</pre></span> */}
                </div>   
                <div className="quiz_status_control">
                    <div className="quiz_form_group">
                        { this.state.quiz_info_array ? this.state.quiz_info_array.map(c => {
                            return (
                                <ResultItem 
                                    person_name = {c[0]}
                                    score = {c[1]}
                                    rank = {c[2]}
                                />
                            )
                            })
                            : "" }
                    </div>       
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