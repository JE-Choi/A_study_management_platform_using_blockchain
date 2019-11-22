import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import $ from 'jquery';
import DateTimePicker from 'react-datetime-picker';
import alert from '../utils/Alert';

class StudyMake extends Component {
    constructor(props) {
        super(props);
        this.state = {
            study_name: '' ,
            study_type: 'TOEIC',
            num_people: '2',
            study_desc: '',
            study_coin: '10',
            study_cnt: '',
            person_id: '', 
            study_id: '',
            person_name:'',
            study_start_date: '',
            study_end_date: new Date(),
            dbStartDate:'',
            dbEndDate: ''
        }
    }

    onEndDateChange = study_end_date => {
        this.setState({ study_end_date });
    }

    // 입력 유무 판단
    check(){
        let study_name = $('#study_make_name').val();
        let study_type = $('#study_make_subject').val();
        let num_people = $('#study_make_total_number').val();
        let study_coin = $('#study_make_coin').val();
        let study_cnt = $('#study_cnt').val();
        let study_desc = $('#study_make_long_desc').val();

        if((study_name !== '')&&(study_type !== '')&&(this.state.study_end_date !== '')&&(num_people !== '')&&(study_coin !== '')&&(study_cnt !== '')&&(study_desc !== '')){
            // 나중에 주석 풀기
            // if((study_cnt < 3)){
            //     return false;
            // }
            return true;
        } else{
            return false;
        }                                      
    }

    componentDidMount() {
        this.make_tag();
        this.getSession();  
        this.timer = setInterval(this.progress, 20); 

        let stDate = new Date();
        let formatted_stDate = '';
        let db_formatted_stDate = '';
        let amPm = '';
        let hour = '';

        if(stDate.getHours() >= 12){
            amPm = '오후';
            if(stDate.getHours() === 12){
                hour = stDate.getHours();
            } else{
                hour = stDate.getHours() - 12;
            }
            formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" "+amPm+" "+hour+":"+stDate.getMinutes();
        
        } else{
            amPm = '오전';
            formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" "+amPm+" "+stDate.getHours()+":"+stDate.getMinutes();
        }
        db_formatted_stDate = stDate.getFullYear()+"-"+(stDate.getMonth()+1)+"-"+stDate.getDate()+" " + stDate.getHours()+":"+stDate.getMinutes();
        this.setState({
            study_start_date: formatted_stDate,
            dbStartDate: db_formatted_stDate
        });
    }
    
    handleFormSubmit = (e) => {
        e.preventDefault();

        if(this.check() === true){
            this.getStudyEndDate();
            setTimeout(()=>{
                this.addstudyItem()
                .then((response) => {
                console.log(response.data);
                let insert_id = response.data.insertId;
                setTimeout(
                    this.addleader(insert_id).then(() =>{
                        // 스터디 가입 완료 확인창
                        alert.confirm('스터디에 가입되었습니다.','자세한 사항은 MyPage에서 확인할 수 있습니다.');
                        this.props.history.push('/mainPage');
                    }), 100);
                })    
            }, 100);    
        } else{
            alert.confirm('형식에 맞게 입력해주세요.');
        }  
    }
    
    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 스터디 목록에 항목 삽입
    addstudyItem = () => {
        const url = '/api/insert/studyitem';
        
        return post(url,  {
            study_name: this.state.study_name,
            study_type: this.state.study_type,
            num_people: this.state.num_people,
            study_start_date: this.state.dbStartDate,
            study_end_date: this.state.dbEndDate,
            study_desc: this.state.study_desc,
            study_coin: this.state.study_coin,
            study_cnt: this.state.study_cnt
        });
    }

    addleader = (studyId) => {
        const url = '/api/insert/study_join';
        console.log(studyId);
        return post(url,  {
            study_id: studyId,
            person_id: this.state.person_id,
            leader: true
        });
    }

    // session 불러오기
    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id : sessionStorage.getItem("loginInfo")});
            this.setState({person_name : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    componentWillMount = async () => {
        clearInterval(this.timer);
    };
    
    make_tag = () =>{
        let subjects = ['TOEIC', 'TOEFL', '토익스피킹', 'OPIC', '전산 관련 자격증', 'GTQ', '한국사능력검정시험', '기타'];
        for(let i = 0; i < subjects.length; i++){
            $("#study_make_subject").append('<option>'+subjects[i]+'</option>');
        }

        for(let i = 2; i < 11; i++){
            $("#study_make_total_number").append('<option>'+i+'</option>');
        }

        for(let i = 1; i < 16; i++){
            $("#study_make_coin").append('<option>'+10*i+'</option>');
        }
    }
    
    getStudyEndDate = () =>{
        let year = $('.react-datetime-picker__inputGroup__year').val();
        let month = $('.react-datetime-picker__inputGroup__month').val();
        let cur_day = $('.react-datetime-picker__inputGroup__day').val();
        let amPm = $('.react-datetime-picker__inputGroup__amPm').val();
        let hour = $('.react-datetime-picker__inputGroup__hour').val();
        let minute = $('.react-datetime-picker__inputGroup__minute').val();

        var datetime = '';
        if(amPm === 'am'){
            datetime = year + "-" + month + "-" + cur_day + " " +  hour+":" + minute;
        } else if(amPm === 'pm'){
            if(hour === 12){
                datetime = year + "-" + month + "-" + cur_day + " " +  (hour) +":" + minute;
            }else {
                hour = String(Number(hour) + 12);
                datetime = year + "-" + month + "-" + cur_day + " " + hour +":" + minute;
            }
        }
        this.setState({
            dbEndDate: datetime
        });
    }

    render() {
        return (
            <div className="pageBackgroundColor">
                <div className="study_make_screen">
                    <div className="study_make_header">
                        <div id="study_make_title">
                            STUDY 생성
                        </div>
                        <p id="study_make_desc">
                            - 스터디를 생성하는 사람이 팀장입니다.
                        </p>
                    </div>
                    <form className="study_make_form" onSubmit={this.handleFormSubmit}>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 명 </label>
                            <span className="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 종류 </label>
                            <span className="dotdot">:</span>
                            <select className="form-control" id="study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 시작 날짜 </label>
                            <span className="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_start_date" name='study_start_date' value={this.state.study_start_date.split(" 오")[0]} onChange={this.handleValueChange} disabled/>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 종료 날짜 </label>
                            <span className="dotdot">:</span>
                            <span id="study_make_end_date">
                                <DateTimePicker
                                    name = 'study_end_date'
                                    onChange={this.onEndDateChange}
                                    value={this.state.study_end_date}
                                />
                            </span>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 모집 인원(명) </label>
                            <span className="dotdot">:</span>
                            <select className="form-control" id="study_make_total_number" name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 가입 Ether (10 Ether 당 10000원) </label>
                            <span className="dotdot">:</span>
                            <select className="form-control" id="study_make_coin" name='study_coin' value={this.state.study_coin}  onChange={this.handleValueChange}> 
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 총 횟수 (최소 3회 이상)</label>
                            <span className="dotdot">:</span>
                            <input type="number" className="form-control" id="study_cnt" name = "study_cnt" value = {this.state.study_cnt} onChange={this.handleValueChange}/>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">설명 </label>
                            <textarea className="form-control" id="study_make_long_desc" rows="7" cols="50" name='study_desc' value={this.state.study_desc}  onChange={this.handleValueChange}></textarea>
                        </div>
                        <div className = "end_date_desc">
                            ★ Study 종료 날짜의 다음 날 또는 횟수가 충족되면<br/> 잔여 Ether를 반환 받을 수 있습니다. ★
                        </div>
                        <button type="submit" className="btn btn-outline-primary btn-lg btn-block " id="btn_study_make">STUDY 생성</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default StudyMake;