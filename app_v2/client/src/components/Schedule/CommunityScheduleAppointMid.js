import React, { Component } from 'react';
import './CommunityScheduleAppoint.css';
import { post } from 'axios';
import $ from 'jquery';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConvertIntoCoordinate from './Coordinate/ConvertIntoCoordinate';
import CenterOfGravity from './CenterOfGravity/CenterOfGravity';
import Map from './Map';

class CommunityScheduleAppointMid extends Component {
  state = {
    joinMemberName: null, // 스터디에 가입된 사람들 이름
    stationArray: [],
    pointArray: [], // 포인터 배열
    centerPoint: null, // 무게중심 위치
    is_centerPoint_x: 0, // map.js에게 전달할 좌표
    is_centerPoint_y: 0 // map.js에게 전달할 좌표
  };

  componentDidMount() {
    // 스터디에 가입된 사람들 이름 추출
    this.getJoinMemberName().then(res => {
      this.setState({ joinMemberName: res.data });
    });
  }

  // 스터디에 가입된 사람들 이름 추출
  getJoinMemberName = async () => {
    const url = '/api/select/studyitemAndperson_info/orderBypersonName';

    return post(url, {
      study_id: sessionStorage.getItem('enterStudyid'),
    });
  };

  // "중간역 검색" 버튼을 눌렀을 때
  handleFormSubmit = async e => {
    e.preventDefault();

    // 각자 역을 모두 다 입력한 경우 
    if (this.checkInputStation() === true) {
      // centerPoint을 null로 set을 해야 Map 컴포넌트에 props를 새로 보냄
      this.setState({
        centerPoint: null
      });
      let stationArray = []; // 스터디 원이 입력한 역 배열
      let is_input_station = true; // 제대로 된 역 입력 여부

      // 사람 수 만큼 반복
      for (let i = 0; i < this.state.joinMemberName.length; i++) {
        let person_name = this.state.joinMemberName[i].PERSON_NAME; // 이름

        // 역 입력 칸이 빈 경우
        if ($('.station_' + person_name).val() === '') {
          is_input_station = false;

          // '올바른 역을 입력해주세요' 모달창
          this.inputRightStationConfirm();
        }
        // 역 입력 칸이 입력된 경우
        else {
          let station = $('.station_' + person_name).val(); // 입력한 역
          let length = station.length; // 입력한 역 글자 수
          let last_letter = station.substring(length - 1); // 입력한 역의 마지막 글자

          // 입력된 마지막 글자가 역이 아니면
          if (last_letter !== '역') {
            $('.station_' + person_name).val(''); // 초기값으로 셋팅
            is_input_station = false;
            // '올바른 역을 입력해주세요' 모달창
            this.inputRightStationConfirm();
          }
          // 입력된 마지막 글자가 역이면
          else {
            stationArray.push($('.station_' + person_name).val()); // 역 배열에 추가
          }
        }
      }

      // 역 입력 칸이 입력된 경우
      if(is_input_station === true){
        // 배열 안의 중복값 제거 (중복 값이 있으면 무게중심 계산 시 오류)
        stationArray = stationArray.reduce(
        function(a,b){
            if(a.indexOf(b) < 0) a.push(b);
            return a;
        },[]);
        console.log(stationArray, new Date());

        // 입력 역 좌표 추출
      await this.extractCoordinate(stationArray);

      let timerId  = setInterval(()=>{
        // 입력한 역 좌표를 모두 추출하면 작업 실행
        if(ConvertIntoCoordinate.check_station_length >= stationArray.length){
          clearInterval(timerId);
    
          // 추출한 좌표들 불러옴.
          let coordinateArray = ConvertIntoCoordinate.coordinateArray;
          console.log('coordinateArray');
          console.log(coordinateArray);

          // 중간 좌표 계산
          CenterOfGravity.getCenterPoint(coordinateArray);

          // 중간 좌표 저장
          this.setState({
              centerPoint: CenterOfGravity.centerPoint
          });
          }
        },1000);
      }
    }
    // 각자 역을 모두 다 입력하지 않은 경우
    else {
      // '올바른 역을 입력해주세요' 모달창
      this.inputRightStationConfirm();
    }
  };

  middleSearchButton = () => {
    console.log(this.state.stationArray);
  };

  // 특정 역의 좌표 추출
  extractCoordinate = async(station) => {
    console.log('station in:', station);
    ConvertIntoCoordinate.clear();
    ConvertIntoCoordinate.extractCoordinate(station);
  };

  // '올바른 역을 입력해주세요' 모달창
  inputRightStationConfirm = () => {
    confirmAlert({
      message: '올바른 역을 다시 입력해주세요.',
      buttons: [
        { 
          label: '확인'
        }],
    });
  };

  // 각자 역을 잘 입력했는지 검사
  checkInputStation = () => {
    let each_input_station = $('.each_input_station').val();

    if(each_input_station !== '') {
      return true;
    }
    else {
      return false;
    }
  }

  render() {
    return (
      <div>
        <form className="sel_direct_form" onSubmit={this.handleFormSubmit}>
          <div className="search_mid_station_div">
            <div className="each_input_station_div">
              {this.state.joinMemberName
                ? this.state.joinMemberName.map(c => {
                    return <JoinMemberNameItem person_name={c.PERSON_NAME} />;
                  })
                : ''}
            </div>
            <div className="button_div">
              <input
                type="submit"
                value="중간역 검색"
                className="btn btn-outline-primary"
                id="btn_search_mid_station"
              />
            </div>
            <div className="search_mid_station_map_div">
              <div className="sel_mid_station_map">
                {this.state.centerPoint !== null?
                  <Map 
                    lon = {this.state.centerPoint.x} 
                    lat = {this.state.centerPoint.y}
                    setNextMeetingLocation = {this.props.setNextMeetingLocation}/>
                  :""}
              </div>
              <div className="search_surrounding form-check form-check-inline"></div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

class JoinMemberNameItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      station: 'form-control',
      direct_input_station: '', // 직접 입력한 자신의 위치와 가까운 역
    };
  }

  componentWillMount() {
    this.setState({
      station: this.state.station + ' station_' + this.props.person_name+ ' each_input_station'
    });
  }

  render() {
    return (
      <div className="each_member_div">
        <span className="each_input_station_label">
          {this.props.person_name}{' '}
        </span>
        <input
          type="text"
          className={this.state.station} 
          placeholder="예) OO역"
        />
      </div>
    );
  }
}

export default CommunityScheduleAppointMid;
