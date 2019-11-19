import React, { Component } from 'react';
import './CommunityScheduleAppoint.css';
import { post } from 'axios';

class ScheduleItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
        meeting_date : '',
        meeting_place : '',
        meeting_time : '',
        study_id : '',
    };
  }

  componentDidMount = () =>{
      this.setState({
        meeting_date : this.props.data.meeting_date,
        meeting_place : this.props.data.meeting_place,
        meeting_time : this.props.data.meeting_time,
        study_id : this.props.data.study_id,
      });
  }
  handleFormSubmit = e => {
    e.preventDefault();
    console.log(this.state.meeting_date, this.state.meeting_time,this.state.study_id);
    this.delSchedule(this.state.study_id, this.state.meeting_date, this.state.meeting_time).then(()=>{
        window.location.reload();
    });
  };

    // 입장한 스터디id의 일정 삭제
    delSchedule = async(_study_id, _meeting_date, _meeting_time) => {
        const url = '/api/delete/study_schedule';
        return post(url,  {
            study_id: _study_id,
            meeting_date: _meeting_date,
            meeting_time: _meeting_time
        });
    }

  render() {
    return (
        <form onSubmit={this.handleFormSubmit}>
            <div className="add_schedule_detail">
                <ul className="list-group list-group-horizontal schedule_detail_content">
                    <li className="list-group-item detail_time">{this.state.meeting_time.substring(0,5)}</li>
                    <li className="list-group-item detail_place">
                        {this.state.meeting_place}
                        <input type="submit" className="btn btn-outline-primary del_schedule" value="삭제" />
                    </li>
                </ul>
            </div>
        </form>
    );
  }
}

export default ScheduleItem;
