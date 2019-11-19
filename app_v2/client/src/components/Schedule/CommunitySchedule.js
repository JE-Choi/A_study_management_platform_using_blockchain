import React, { Component } from 'react';
import dateFns from "date-fns";
import './CommunitySchedule.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import ScheduleAppoint from './CommunityScheduleAppoint';
import { post } from 'axios';
import SetStudyEndTransfer from '../AboutStudyEnd/SetStudyEndTransfer';
import InitContract from '../BlockChain/InitContract';
import ProgressBarBackGround from '../../utils/ProgressBar/ProgressBarBackGround';
import ScheduleItem from './ScheduleItem';
import $ from 'jquery';
import ProgressBar from '../../utils/ProgressBar/ProgressBar';

class CommunitySchedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_visible:false
    }
  }

  componentDidMount = () =>{
    console.log(InitContract.web3);
    InitContract.init().then((is_end)=>{
      if(is_end === true){
        this.setState({
          is_visible: true
        });
        console.log(InitContract.web3);
        // SetStudyEndTransfer.callStudyInfo(sessionStorage.getItem("enterStudyid")).then((res)=>{
        //   let endDate = res[0].endDate;
        //   let study_cnt = res[1].study_cnt;
        //   console.log(endDate, study_cnt);
        // });
      }
    });
  }
    render() {
        return (
          <Router>
            <div className="pageBackgroundColor">
             {this.state.is_visible === true?
                 <div className="content_schedule">
                  <CalendarTop id = {this.props.match.params.id} history = {this.props.history}/>
                    <Switch>
                      <Route exact path='/community/:id/communitySchedule' component = { Calendar } /> 
                      <Route exact path='/community/:id/communitySchedule/addAppointment' component = { ScheduleAppoint } />
                      <Route exact path='/community/:id' component = { Calendar } /> 
                    </Switch>
                </div>
              :<ProgressBar message ='로딩중'/>}
              </div>
            
          </Router>
        );
      }
  }

class CalendarTop extends Component{
  constructor(props) {
    super(props);
    this.state = {
      study_name: '' ,
      study_type: '',
      end_date: '',
      cnt_total: '',
      cnt: ''
    }
  }

  componentDidMount() {
    this.callLoadApi(this.props.id)
      .then(res => {
        let study_name = res[0].study_name;
        let study_type = res[0].study_type;
        let study_id = res[0].s_id;
       
        this.call_totalCntAndCnt(study_id).then((res)=>{
          let date_a = [];
          let study_cnt = '';
          SetStudyEndTransfer.callStudyInfo(sessionStorage.getItem("enterStudyid")).then((study_res)=>{
            date_a = (study_res[0].endDate).split('-');
            study_cnt = study_res[1].study_cnt;
            
            if(res.data.length !== 0){
              let _cnt = res.data.length;
              this.setState ({
                cnt: _cnt,
                study_name: study_name,
                study_type: study_type,
                cnt_total: study_cnt,
                end_date: date_a[0]+'년 '+date_a[1]+'월 '+date_a[2]+'일'
              });
          } else{
              this.setState ({
                cnt: 0,
                study_name: study_name,
                study_type: study_type,
                cnt_total: study_cnt,
                end_date: date_a[0]+'년 '+date_a[1]+'월 '+date_a[2]+'일'
              });
          }
          });
        })
    }).catch(err => console.log(err));
  }

  callLoadApi = async (id) => {
    const response = await fetch('/api/studyItems/view/' + id);
    const body = await response.json();
    return body;
  }

  // 스터디 잔여횟수, 총 횟수 구하기
  call_totalCntAndCnt = async(_study_id) => {
    const url = '/api/select/cnt/cnt_total';
    return post(url,  {
        study_id: _study_id
    });
  }

  render(){
    console.log(this.state.is_add_appointment_btn);
    return(
      <div className="calendarTop">
          <div className = "calendarTop_div">
            <span className="calendarTop_name">{this.state.study_name}</span>
            <br className="name_br" />
            <span className="calendarTop_name"> - </span>
            <span className="calendarTop_type">{this.state.study_type}</span>
            <br/>
            <span className="calendarTop_study_period">종료 날짜: {this.state.end_date}</span>
            <br/>
            <div className="calendarTop_study_cnt">스터디 잔여횟수: <span>{this.state.cnt}</span> / <span>{this.state.cnt_total} 회</span></div>
          </div>
      </div>
    );
  }
}

// 공통 스케줄러
class Calendar extends Component{
     // 기본적으로 오늘 날짜를 사용하므로 구성 요소에 추가
     state = {
        currentMonth: new Date(),
        selectedDate: new Date(),
        scheduleArray:[],
        scheduleArray_items: [],
        studyEnd: false,
        end_transaction_end : false
      };

      // 스케줄러에 일정 초기화
      componentDidMount = async() => {
        $('.progress_layer').hide();
        // 입장한 스터디id의 일정 모두 불러오기
        this.selectStudy_schedule().then((res)=>{
      
          let scheduleArray = this.state.scheduleArray;
          for(let i = 0;i<res.data.length;i++){
            
            let meeting_date = res.data[i].meeting_date;
            // 스터디 날짜만 배열에 저장
            // 해당 날짜의 여러 일정이 있을 수도 있으므로 쿼리 결과의 중복 제거
            if(scheduleArray.indexOf(meeting_date)){
              scheduleArray.push(meeting_date);
            }
          }

          let d_day = new Date();
          let selectDay = dateFns.format(d_day, 'YYYY-M-D');
          // 선택한 날짜의 일정 불러오기
          this.selectStudy_schedule_item(selectDay).then((res)=>{
            console.log(res.data);
            this.setState({
              scheduleArray_items: res.data
            });
          })

          // 일정 나타내는 배열에 set
          this.setState({
            scheduleArray: scheduleArray
          });
        });
        this.callLoadApi(this.props.match.params.id).then((data)=>{
          sessionStorage.setItem("enterStudyitem", JSON.stringify(data)); // 객체를 session에 저장하기 위함
          console.log(data[0]);
          let is_end = data[0].is_end;
          let studyId = data[0].s_id;
          // 스터디 종료 거래가 실행되지 않은 경우
            if(is_end === 0){
              SetStudyEndTransfer.callStudyInfo(sessionStorage.getItem("enterStudyid")).then((study_res)=>{
                let endDate = study_res[0].endDate;
                let _d_endDate = new Date(endDate +' 00:00:01');
                let study_cnt = study_res[1].study_cnt;
                this.checkEndStudy(studyId, study_cnt, _d_endDate);
              });
            } 
            // 스터디 종료 거래가 실행된 적이 있는 경우
            else{
              this.setState({
                studyEnd: true,
                end_transaction_end: true
              });
            }
        });
      }

    callLoadApi = async (id) => {
      const response = await fetch('/api/studyItems/view/' + id);
      const body = await response.json();
      return body;
    }
    // 스터디 잔여횟수, 총 횟수 구하기
    call_totalCntAndCnt = async(_study_id) => {
      const url = '/api/select/cnt/cnt_total';
      return post(url,  {
          study_id: _study_id
      });
    }

    checkEndStudy = async(studyId, _study_cnt, _endDate) =>{
      this.call_totalCntAndCnt(studyId).then((res)=>{
        let nowDate = new Date();
        console.log("확인 필요:", res.data);
        if(res.data.length !== 0){
          let _cnt = res.data.length;
          console.log({'study_cnt':_study_cnt}, {'_cnt':_cnt}, _study_cnt === _cnt);
          // 스터디 종료 버튼의 가시화 유무 설정
          if(_study_cnt === _cnt){
            // 스터디 횟수 충족인 경우
            console.log('스터디 총 진행 횟수 조건 성립');
            // 출석한 가장 최신 날짜 확인
           let date_array = [];
           for(let i =0 ; i < res.data.length; i++){
             let date = new Date(res.data[i].attendance_start_date+" 23:59:59");
             date_array.push(date);
           }
           date_array.sort(function(a,b){return b-a;});
           console.log(date_array[0]);
           let now_date = new Date();
           console.log(now_date);
           
           // 다음날로 실험할 때 사용하는 테스트 코드
           now_date = new Date(now_date.getFullYear()+"."+(Number(now_date.getMonth())+1)+"."+(Number(now_date.getDate())+1)+" 00:00:00");

          // 오늘 날짜가 횟수가 충족된 날짜보다 이후 인 경우
          if(now_date > date_array[0]){
          // 스터디 종료 버튼 가시화
          this.setState({
            studyEnd: true
          });
          sessionStorage.setItem("studyEnd", 1);
          } 
          // 오늘 날짜가 횟수가 충족된 날짜보다 같거나 이전 인 경우
          else{
          // 스터디 종료 버튼 가시화
          this.setState({
            studyEnd: false
          });
          sessionStorage.setItem("studyEnd", 0);
        }
           
          } else{
            // 스터디 횟수 미 충족인 경우
            console.log('스터디 총 진행 횟수 잔여');
            console.log({'_endDate':_endDate}, {'nowDate':nowDate}, _endDate < nowDate);
            // 현재 날짜가 스터디 종료날짜를 지났다면 (같은 경우는 제외)
            if(_endDate < nowDate){
              // 스터디 횟수는 충족하지 못 했지만, 스터디 종료 날짜는 지남.
              this.setState({
                studyEnd: true
              });
              sessionStorage.setItem("studyEnd", 1);
            } else {
              // 스터디 횟수, 스터디 종료날짜 모두 미 충족
              this.setState({
                studyEnd: false 
              });
              sessionStorage.setItem("studyEnd", 0);
            }
          }
        } 
        // 스터디가 한번도 실행되지 않았지만, 스터디 종료 날짜가 지난 경우
        else {
          console.log({'_endDate':_endDate},{'nowDate':nowDate}, _endDate < nowDate);
          if(_endDate < nowDate){
            // 스터디 횟수는 충족하지 못 했지만, 스터디 종료 날짜는 지남.
            this.setState({
              studyEnd: true
            });
            sessionStorage.setItem("studyEnd", 1);
          } else{
            this.setState({
              studyEnd: false
            });
            sessionStorage.setItem("studyEnd", 0);
          }
        }
      });
    }

      // 렌더링을위한  함수 1) renderHeader 2) renderDays 3) renderCells
      renderHeader() {
        const dateFormat = "MMMM YYYY";
    
        return (
          <div className="header row flex-middle">
            <div className="col col-start">
              <div className="icon" onClick={this.prevMonth}>
                chevron_left
              </div>
            </div>
            <div className="col col-center">
              <span>{dateFns.format(this.state.currentMonth, dateFormat)}</span>
            </div>
            <div className="col col-end" onClick={this.nextMonth}>
              <div className="icon">chevron_right</div>
            </div>
          </div>
        );
      }
    
      renderDays() {
        const dateFormat = "dd";
        const days = [];
        let startDate = dateFns.startOfWeek(this.state.currentMonth);

        for (let i = 0; i < 7; i++) {
          days.push(
            <div className="col col-center" key={i}>
              {dateFns.format(dateFns.addDays(startDate, i), dateFormat)}
            </div>
          );
        }
    
        return <div className="days row">{days}</div>;
      }
    
      renderCells() {
        const { currentMonth, selectedDate } = this.state;
        const monthStart = dateFns.startOfMonth(currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const startDate = dateFns.startOfWeek(monthStart);
        const endDate = dateFns.endOfWeek(monthEnd);
    
        const dateFormat = "D";
        const rows = [];
    
        let days = [];
        let day = startDate;
        let formattedDate = "";
    
        // 날짜 요소 생성
        while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
            formattedDate = dateFns.format(day, dateFormat);
            const cloneDay = day;
            let classDay = dateFns.format(day, 'YYYY-M-D');
            
            days.push(
              <div
                className={`col cell ${
                  !dateFns.isSameMonth(day, monthStart)
                    ? "disabled"
                    : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
                } ${
                  dateFns.isSaturday(day) ? "saturday" : ""
                } ${
                  dateFns.isSunday(day) ? "sunday" : ""
                }`}
                key={day}
                onClick={() => this.onDateClick(dateFns.parse(cloneDay))}
              >
               {/* 일정이 있다면! */}
                {this.isScheduleArray(classDay)!== -1? 
                  // 일정 등록 아이콘 
                  <div className={`ScheduleExistence`}>★</div>
                :''}
                <span className="number">{formattedDate}</span>
              </div>
            );
            day = dateFns.addDays(day, 1);
          }
          rows.push(
            <div className="row" key={day}>
              {days}
            </div>
          );
          days = [];
        }
        return <div className="body">{rows}</div>;
      }
    
      // 날짜 클릭했을 때
      onDateClick = day => {
        this.setState({
          selectedDate: day
        });
        let selectDay = dateFns.format(day, 'YYYY-M-D');
        // 선택한 날짜의 일정 불러오기
        this.selectStudy_schedule_item(selectDay).then((res)=>{
          this.setState({
            scheduleArray_items: res.data
          });
        })
      };
    
      nextMonth = () => {
        this.setState({
          currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
        });
      };
    
      prevMonth = () => {
        this.setState({
          currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
        });
      };

      isScheduleArray = (classDay) =>{
        let  scheduleArray = this.state.scheduleArray;
        return scheduleArray.indexOf(classDay);
      }

      // 선택한 날짜의 일정 불러오기
      selectStudy_schedule_item = async(day) => {
        const url = '/api/select/study_schedule/where/day';
        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid"),
            day: day
        });
      }

      // 입장한 스터디id의 일정 모두 불러오기
      selectStudy_schedule = async(day) => {
        const url = '/api/select/study_schedule';
        return post(url,  {
            study_id: sessionStorage.getItem("enterStudyid")
        });
      }

      // 화면 새로고침
      setReload = () =>{
        setTimeout(function() { 
          window.location.reload();
        }, 100);
      }

      study_end_process = async() =>{
        let study_id = sessionStorage.getItem("enterStudyid");
        $('.progress_layer').show();
        SetStudyEndTransfer.run(study_id).then(()=>{
          sessionStorage.setItem("studyEnd", 1);
          this.setState({
            end_transaction_end: true
          });
        });
      }

      render() {
        return (
          <div className="content_calendar">
            <div className="calendarTop_add_schedule">
                  
                  {this.state.studyEnd === true ? 
                  this.state.end_transaction_end === false ? 
                  <input type="button" className="btn btn-outline-primary" id="study_end_btn" value="Ether 반환" onClick={this.study_end_process} />
                  :""
                    : 
                    <Link to={'/community/'+this.props.match.params.id+'/communitySchedule/addAppointment'} className="community_nav_link btn btn-outline-primary" id="add_appointment_btn">
                      일정 추가
                    </Link>
                  }  
            </div>
            <br className="calendar_br"/>
            <br className="calendar_br"/>
            <div className="calendar">
              {this.renderHeader()}
              {this.renderDays()}
              {this.renderCells()}
            </div>
         
            <div className="add_today_schedule">
              {/* 추가된 일정 안내 */}
              {this.state.scheduleArray_items.length !== 0?
                <ul className="list-group list-group-horizontal schedule_detail_lbl">
                  <li className="list-group-item active detail_time_lbl">일시</li>
                  <li className="list-group-item active detail_place_lbl">장소</li>
                </ul>
              :""}
              {this.state.scheduleArray_items ? this.state.scheduleArray_items.map(c => {
                  return (
                    <ScheduleItem data = {c}/>
                  )
                })
                : "" }
            </div>
            <ProgressBarBackGround 
                    message = "종료 거래 진행하는 중..." 
                    sub_msg1="잠시만 기다려 주세요."/>
          </div>
        );
      }
}

export default CommunitySchedule;