import React, { Component } from 'react';
import Map from './map';
import './styles.css';
import '../CommunityScheduleAppoint.css';

class index extends Component {
  state = {
    lon: this.props.lon, // 받아올 위도 경도
    lat:  this.props.lat,
    mapList: null,
  };

  render() {
    return (
      <div>
        <Map 
          lon = {this.state.lon} 
          lat = {this.state.lat} 
          setNextMeetingLocation = {this.props.setNextMeetingLocation}
        />
      </div>
    );
  }
}

export default index;