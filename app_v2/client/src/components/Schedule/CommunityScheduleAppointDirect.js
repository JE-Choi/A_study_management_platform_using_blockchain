import React, { Component } from 'react';
import './CommunityScheduleAppoint.css';

class CommunityScheduleAppointDirect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      direct_input_loc: '',
    };
  }

  handleFormSubmit = e => {
    e.preventDefault();
    this.props.setNextMeetingLocation(this.state.direct_input_loc);
  };

  handleValueChange = e => {
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  };

  render() {
    return (
      <div className="sel_direct_div">
        <form className="sel_direct_form" onSubmit={this.handleFormSubmit}>
          <div className="sel_direct_input">
            <input
              type="text"
              className="form-control"
              id="sel_direct_input_search"
              placeholder="만날 장소"
              name="direct_input_loc"
              value={this.state.direct_input_loc}
              onChange={this.handleValueChange}
            />
            <input
              type="submit"
              value="설정"
              className="btn btn-outline-primary"
              id="btn_sel_direct_input"
            />
          </div>
        </form>
        <div className="sel_direct_desc">
          다음에 만날 장소를 입력해주세요. 예) 신촌 토즈
        </div>
      </div>
    );
  }
}

export default CommunityScheduleAppointDirect;
