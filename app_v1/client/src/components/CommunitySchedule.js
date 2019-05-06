import React, { Component } from 'react';
import { post } from 'axios';
import dateFns from "date-fns";
import './CommunitySchedule.css';
// dateFns 사용법 - 달력 데이터
//https://date-fns.org/v1.9.0/docs/isWeekend

class CommunitySchedule extends React.Component {
    render() {
        return (
          <div className="main_schedule">
              <div className="content_schedule">
                <CalendarTop id = {this.props.match.params.id}/>
                <div className="calendar">
                  <Calendar/>
                </div>
              </div>
          </div>
        );
      }
  }

class CalendarTop extends Component{

  constructor(props) {
    super(props);
    this.state = {
      study_name: '' ,
      study_type: '',
      study_period: ''
    }
  }

  componentDidMount() {
    
    this.callLoadApi(this.props.id)
      .then(res => {
        this.setState ({
          study_name: res[0].study_name,
          study_type: res[0].study_type,
          study_period: res[0].study_period
        });
    }).catch(err => console.log(err));
  }

  callLoadApi = async (id) => {
    const response = await fetch('/api/studyItems/view/' + id);
    const body = await response.json();
    return body;
  }

  render(){
    return(
      <div>
          <div className = "calendarTop_div">
            <span className="calendarTop_name">{this.state.study_name}</span>
            <span className="calendarTop_name"> - </span>
            <span className="calendarTop_name">{this.state.study_type}</span>
            <br/>
            <span className="calendarTop_study_period">스터디 기간: {this.state.study_period}주</span>
          </div>
      </div>
    );
  }
}

class Calendar extends Component{
     // 기본적으로 오늘 날짜를 사용하므로 구성 요소에 추가
     state = {
        currentMonth: new Date(),
        selectedDate: new Date()
      };
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
    
      onDateClick = day => {
        this.setState({
          selectedDate: day
        });
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
    
      render() {
        return (
          <div className="calendar">
            {this.renderHeader()}
            {this.renderDays()}
            {this.renderCells()}
          </div>
        );
      }
}

export default CommunitySchedule;