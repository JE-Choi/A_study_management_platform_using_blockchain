import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';
import $ from 'jquery';
import DateTimePicker from 'react-datetime-picker';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';

import { createBrowserHistory } from 'history';

class RenameStudy extends Component {
    render() {
        return (
            <div className="pageBackgroundColor">
                <div className="study_make_screen">
                   <div className="study_make_header">
                        <div id="study_make_title">
                            STUDY 수정
                        </div>
                   </div>
                    <FormComponent id={this.props.match.params.id}/>
                </div>
            </div>
        );
    }
}

class FormComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            study_item_info: '',
            completed: 0,
            study_name: '' ,
            study_type: '',
            num_people: '',
            study_coin: '',
            study_desc: '',

            study_start_date: '',
            study_end_date: '',

            dbStartDate:'',
            dbEndDate: ''
        }
    }

    onEndDateChange = study_end_date => {
        this.setState({ study_end_date });
    }

    handleFormSubmit = (e) => {
        e.preventDefault(); 
        const history = createBrowserHistory();
        if(this.check() === true){
            this.getStudyEndDate();
            setTimeout(()=>{
                this.callRenameApi().then((response) => {
                    console.log(response.data);
                    history.push('/mainPage'); 
                    window.location.reload();
                })
            }, 100);
            
        } else{
            this.reInputConfirm();
        }
       
    }

    handleValueChange = (e) => {
        let nextState = {};
        // 만약 이름 변경하면 변경된 값을 state에 반영한다.
        console.log(e.target.name + ': ' + e.target.value);
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    componentDidMount() {
        this.make_tag();
        this.callApi()
          .then(res => {
                let start_date = new Date(res[0].start_date);
                let end_date = new Date(res[0].end_date);
              
                let s_year = String(start_date.getFullYear());
                let s_month = String(start_date.getMonth()+1);
                let s_date = String(start_date.getDate());

                let view_start_date = s_year+'-'+s_month+'-'+s_date;

                // let e_year = String(end_date.getFullYear());
                // let e_month = String(end_date.getMonth()+1);
                // let e_date = String(end_date.getDate());
                // let e_hour = String(end_date.getHours());
                // let e_minute = String(end_date.getMinutes());
                // let view_end_date = e_year+'-'+e_month+'-'+e_date+'  '+e_hour+':'+e_minute;
                
                this.setState({
                    completed: 0, 
                    study_name: res[0].study_name,
                    study_type: res[0].study_type,
                    num_people: res[0].num_people,
                    study_start_date: view_start_date,
                    study_end_date: end_date,
                    study_coin: res[0].study_coin,
                    study_desc: res[0].study_desc
                })
            }).catch(err => console.log(err));
                // this.setState({study_item_info: res});
    }
    
    callApi = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.id);
        const body = await response.json();
        return body;
    }

    callRenameApi = () => {
        const url = '/api/studyItems/view/rename/';

        return post(url,  {
            rename_index: this.props.id,
            study_name:  this.state.study_name,
            study_type: this.state.study_type,
            num_people: this.state.num_people,
            study_start_date: this.state.study_start_date,
            study_end_date: this.state.dbEndDate,
            study_coin: this.state.study_coin,
            study_desc: this.state.study_desc
        });
    }

    getStudyEndDate(){
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

    make_tag(){
        let subjects = [' ','TOEIC', 'TOFEL', '토익스피킹', 'OPIC', '전산 관련 자격증', 'GTQ', '한국사능력검정시험', '기타'];
        for(let i = 0; i < subjects.length; i++){
            $("#re_study_make_subject").append('<option>'+subjects[i]+'</option>');
        }
        
        for(let i = 2; i < 11; i++){
            $("#re_study_make_total_number").append('<option>'+i+'</option>');
        }
        
        for(let i = 1; i < 11; i++){
            $("#re_study_make_coin").append('<option>'+i+'</option>');
        }
    }

    reInputConfirm = () => {
        confirmAlert({
            title: '모든 항목을 입력해주세요',
            buttons: [
            {
                label: '확인'
            }
          ]
        })
    }

    // 입력 유무 판단
    check(){            
        let re_study_make_name = $('#re_study_make_name').val();
        let re_study_make_type = $('#re_study_make_subject').val();
        let re_study_make_total_number = $('#re_study_make_total_number').val();
        let re_study_make_coin = $('#re_study_make_coin').val();
        let re_study_make_long_desc = $('#re_study_make_long_desc').val();

        if((re_study_make_name !== '')&&(re_study_make_type !== '')&&(this.state.study_end_date !== '')&&(re_study_make_total_number !== '')&&(re_study_make_coin !== '')&&(re_study_make_long_desc !== '')){
            return true;
        } else{
            return false;
        }
    }
      
    render() {
        return(
            <form className="study_make_form" onSubmit = {this.handleFormSubmit}>
                <div className="study_make_form_group">
                    <label className="study_make_label">스터디 명: </label>
                    <span className="dotdot">:</span>
                    <input type="text" className="form-control" id="re_study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">종류 </label>
                    <span className="dotdot">:</span>
                    <select className="form-control" id="re_study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
                    </select>
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">Study 시작 날짜 </label>
                    <span className="dotdot">:</span>
                    <input type="text" className="form-control" id="re_study_make_start_date" name='study_start_date' value={this.state.study_start_date} onChange={this.handleValueChange} disabled/>
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">Study 종료 날짜 </label>
                    <span className="dotdot">:</span>
                    <span id="re_study_make_end_date">
                        <DateTimePicker
                            name = 'study_end_date'
                            onChange={this.onEndDateChange}
                            value={this.state.study_end_date}
                            disabled
                        />
                    </span>                             
                </div>               
                <div className="study_make_form_group">
                    <label className="study_make_label">Study 모집 인원(명) </label>
                    <span className="dotdot">:</span>
                    <select className="form-control" id="re_study_make_total_number"  name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>  
                    </select>
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">스터디 가입 코인: </label>
                    <span className="dotdot">:</span>
                    <select className="form-control" id="re_study_make_coin"  name='study_coin' value={this.state.study_coin}  onChange={this.handleValueChange} disabled>  
                    </select>
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">설명 </label>
                    <textarea className="form-control" id="re_study_make_long_desc" rows="7" cols="50" name='study_desc' value={this.state.study_desc}  onChange={this.handleValueChange}></textarea>
                </div>
                <button type="submit" className="btn btn-outline-info btn-lg btn-block " id="re_btn_study_make">STUDY 수정</button>
            </form>
        );
    }
}

export default RenameStudy;