import React, { Component } from 'react';
import './AboutCommunity.css';
import { post } from 'axios';

class AboutQuiz extends Component {
    render() {
        return (
            <div className="main">
                <div className="content">
                    <QuizScore />
                </div>
            </div>
        )
    }
}

class QuizScore extends Component {

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
            // DB에서 해당 스터디 최근 날짜 불러오기
            this.getQuizDate().then((res)=>{

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

                // 스터디에 있는 스터디원 이름 불러오기
                this.getPersonName().then((res)=>{

                    let name_array = new Array();
                    for(let i = 0; i < res.data.length; i++){
                        console.log(res.data[i].person_name);
                        name_array.push(res.data[i]);
                    }
                    this.setState({
                        userNameArray : name_array
                    });
                });
            });
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

    // 출석 시간 버튼 누를 때
    handleFormSubmit = (e) => {
        e.preventDefault();
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
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
            <div className="div_quiz_score">
                <div className="quiz_header">퀴즈 점수</div>
                <div className="quiz_content">
                    <div>
                        <span className="quiz_today_header">{this.state.quiz_month}월 {this.state.quiz_day}일  퀴즈  결과</span>
                        {/* <span><pre className="quiz_today_header">{this.state.quiz_month}월 {this.state.quiz_day}일  퀴즈  결과</pre></span> */}
                    </div>   
                    <div className="quiz_status_control">
                        <form onSubmit={this.handleFormSubmit}>
                            <div className="quiz_form_group">
                                {/* <div className="each_quiz_point"> */}
                                    {/* <label className="quiz_name_label" value={this.state.userName} >user1 </label> */}
                                    {/* <label className="quiz_name_label">{this.state.userName} </label> */}
                                    { this.state.userNameArray ? this.state.userNameArray.map(c => {
                                        return (
                                            <NameItem 
                                                person_name = {c.person_name}
                                            />
                                        )
                                        })
                                        : "" }
                                  {/* <input type="text" className="form-control" id="quiz_score" name="quiz_score_1" value={this.state.userScore} onChange={this.handleValueChange} /> */}
                                    {/* <select className="form-control" id="quiz_score" name='quiz_score' value={this.state.userScore} onChange={this.handleValueChange}>
                                    </select> */}
                                {/* </div> */}
                                <div className="btn_div">
                                    <button type="submit" className="btn btn-outline-danger btn-lg btn-block " id="btn_quiz_score_input">점수 입력</button>
                                </div>
                            </div>
                        </form>
                    </div>    
                </div>
            </div>
        );
    }
}

class NameItem extends Component {

// {/* DB에 있는 사용자 수만큼 불러오기 */}
// {/* 아래 두 줄 둘 중 하나 */}
                                // {/* <div className="each_quiz_point"> */}
                                //     {/* <label className="quiz_name_label" value={this.state.userName} >user1 </label> */}
                                //     {/* <label className="quiz_name_label">{this.state.userName} </label> */}
    render() {
        return(
            <div>
                <div className="each_quiz_point">
                    <label className="quiz_name_label">{this.props.person_name}</label>
                    <span className="dotdot">:</span>
                    <input type="number" min="0" max="100" placeholder="100" className="form-control" id="quiz_score" name="quiz_score_1" onChange={this.handleValueChange} />

                    {/* <input type="text" className="form-control" id="quiz_score" name="quiz_score_1" value={this.state.userScore} onChange={this.handleValueChange} /> */}
                    {/* <select className="form-control" id="quiz_score" name='quiz_score' value={this.state.userScore} onChange={this.handleValueChange}>
                    </select> */}
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
            // study_id: '', // 스터디 id
            // userName: '', // 스터디 원 이름
            // user_score: 0, // 퀴즈 점수
            // quiz_date: '' // 퀴즈 날짜
        }
    }

    componentDidMount= async () => {

    }

    render() {
        return(
            <div>
                <div className="final_result">
                    <div id="final_result_header">최종 결과</div>
                    <div className="final_result_content">
                        <div className="each_result">{this.props.person_name} : 1등</div>
                        <div className="each_result">user2 : 2등</div>
                        <div className="each_result">user3 : 3등</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AboutQuiz;