import React, { Component } from 'react';
import './CommunityScheduleAppoint.css';
import DateTimePicker from 'react-datetime-picker';
import $ from 'jquery';
import AppointDirectSelect from './CommunityScheduleAppointDirect';
import AppointMidSelect from './CommunityScheduleAppointMid';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// 다음 스터디 약속 추가
class CommunityScheduleAppoint extends Component{
    constructor(props) {
      super(props);
      this.state = {
        study_id: 0,
        next_meeting_date: new Date(), // 다음에 만날 날짜
        next_meeting_location: '아래 버튼으로 장소 지정', // 다음에 만날 장소
        sel_input_line: '',
        way: 'none'
      }
    }

    componentDidMount() {
        $('.direct_sel_div').hide();
        $('.mid_sel_div').hide();

        this.setState({
            study_id : sessionStorage.getItem("enterStudyid")
        });
    }

    // 다음에 만날 장소 설정
    setNextMeetingLocation = (direct_input_loc) => {
        this.setState({
            next_meeting_location : direct_input_loc
        });
    }

    // 다음 스터디 날짜 선택
    selectNextDay = next_meeting_date => {
        this.setState({ next_meeting_date });
    }

    // 직접 선택 버튼을 눌렀을 경우
    clickSelDirect = () =>{
        this.setState({way : 'direct'});
    }

    // 중간역 찾기 버튼을 눌렀을 경우
    clickMidStation = () =>{
        this.setState({way : 'mid'});
    }

    // 직접 선택인지, 중간역 찾기 버튼인지 set
    setWay = (way) =>{
        this.setState({way : way});
    }

    // 일정 추가 버튼
    addFinalSchedule = () =>{
        // DB에 날짜, 장소 추가
        this.addStudySchedule().then((res) => {
            // 달력 화면 이동
            this.props.history.push('/community/' + this.props.match.params.id + '/communitySchedule');
        });
    }

    // DB에 날짜, 장소 추가
    addStudySchedule = () => {
        const url = '/api/insert/study_schedule';

        let year = this.state.next_meeting_date.getFullYear();
        let month = this.state.next_meeting_date.getMonth()+1;
        let date = this.state.next_meeting_date.getDate();
        let hour = this.state.next_meeting_date.getHours();
        let minute = this.state.next_meeting_date.getMinutes();
        let second = this.state.next_meeting_date.getSeconds();

        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid"),
            meeting_date: year+'-'+month+'-'+date,
            meeting_time: hour+':'+minute+':'+second,
            meeting_place: this.state.next_meeting_location 
        });
    }

    // 장소 칸을 잘 입력했는지 검사
    checkInputLocation = () => {
        let input_location = $('#input_location').val();
        if(input_location==='아래 버튼으로 장소 지정' || input_location==='') {
            // '장소를 지정해주세요' 모달창
            this.inputRightLocationConfirm();
        } else{
            this.addFinalSchedule();
        }
    }

    // '장소를 지정해주세요' 모달창
    inputRightLocationConfirm = () => {
        confirmAlert({
        message: '장소를 지정해주세요.',
        buttons: [
            { 
            label: '확인'
            }],
        });
    };
  
    render() {
      return (
        <div className="set_day_place">
            <div className="input_meeting_day_div">
                <label className="input_meeting_day_label">날짜 </label>
                <span className="dot">:</span>
                <span className="next_meeting_date">
                    <DateTimePicker
                        name = 'next_meeting_date'
                        onChange={this.selectNextDay}
                        value={this.state.next_meeting_date}
                    />
                </span>
            </div>
            <br/>
            <div className="input_place_div">
                <label className="input_place_label">장소 </label>
                <span className="dot">:</span>
                <input type="text" className="form-control" id="input_location" value={this.state.next_meeting_location} readOnly/>
                <div className="input_place_method">
                    <input type="button" value="직접 선택" className="btn btn-outline-primary" id="btn_sel_direct" onClick = {this.clickSelDirect} />
                    <input type="button" value="중간역 찾기" className="btn btn-outline-primary" id="btn_sel_mid_station" onClick = {this.clickMidStation} />
                </div>
            </div>

            {this.state.way === "direct"? 
                <div className="direct_sel_div">
                <AppointDirectSelect setNextMeetingLocation = {this.setNextMeetingLocation}/>
                </div>    
                :
                this.state.way ==="mid"?
                <div className="mid_sel_div">
                    <AppointMidSelect setNextMeetingLocation = {this.setNextMeetingLocation} setWay = {this.setWay}/>
                </div>
            :''}

            <div className="add_schedule_div">
                <input type="button" value="일정 추가" className="btn btn-outline-primary" id="btn_add_schedule" onClick={this.checkInputLocation} />
            </div>
        </div>
      );
    }
}

export default CommunityScheduleAppoint;