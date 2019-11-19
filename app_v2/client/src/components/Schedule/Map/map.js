import * as React from 'react';
import $ from 'jquery';
import locationIcon from '../../../utils/Img/Map/placeholder_red.png';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';
import dotenv from "dotenv";
dotenv.config();
declare var Tmap: any;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      test:'s',
      mid_direct_input_loc:'',
      map:null
    };
  }

  componentDidMount = () => {
    let map, is_resize =false;

    map = new window.Tmap.Map({
      div: 'map_div', // map을 표시해줄 div
      width: '100%', // map의 width 설정
      height: '400px', // map의 height 설정
    });

    this.createMap(this.props.lon, this.props.lat, this.midHandleFormSubmit, map).then(()=>{
      // 화면 크기 감지
      let timeout = setInterval(function(){
        let mq = window.matchMedia("(max-width: 1200px)");
        if (mq.matches) {
          /* 뷰포트 너비가 1200 픽셀 이하 */
          var mapResize = document.getElementById('map_div');//map의 div
          mapResize.style.width = '100%';//map의 width 변경
          mapResize.style.height = '200px';//map의 height 변경 
          map.updateSize();

          if(is_resize === false){
            is_resize = true;
            clearInterval(timeout);
            map.zoomTo(14);
          }
        }
      }, 1000); // 타이머 1초 간격으로 수행
    });
  };

  createMap = async(_lon, _lat, midHandleFormSubmit, map) =>{
    console.log(new Date())
    // 1. 지도 띄우기
    // map 생성
    // Tmap.map을 이용하여, 지도가 들어갈 div, 넓이, 높이를 설정
    var map = map, markerLayer;

    map.setCenter(
      new window.Tmap.LonLat(_lon, _lat).transform(
        'EPSG:4326',
        'EPSG:3857'
      ),
      15
    ); // 설정한 좌표를 "EPSG:3857"로 좌표변환한 좌표값으로 중심점을 설정

    this.setState({
      map:map
    });

    //2. POI 통합 검색 API 요청
    // 2. 주변 POI 검색 API 요청
    $.ajax({
      method: 'GET',
      url:
        process.env.REACT_APP_API_MAP_URL, // 주변 POI 검색 api 요청 url
      async: false,
      data: {
        categories: '지하철;',
        resCoordType: 'EPSG3857', //응답 좌표계 유형
        reqCoordType: 'WGS84GEO', //요청 좌표계 유형
        centerLon: _lon,
        centerLat: _lat,
        //멀티 입구점
        //Y:멀티입구점 미지원
        //N:멀티입구점 지원
        multiPoint: 'N',
        appKey: process.env.REACT_APP_API_KEY2, 
        count: 50, //페이지당 출력되는 개수를 지정
      },
      //데이터 로드가 성공적으로 완료되었을 때 발생하는 함수
      success: function(response) {
        // POI 상세 정보 API
        var prtcl = response;

        // 근접 역 있는 경우 
        if(prtcl !== undefined){
          // 2. 기존 마커, 팝업 제거
          if (markerLayer != null) {
            markerLayer.clearMarkers();
            map.removeAllPopup();
          }

          // 3. POI 마커 표시
          markerLayer = new Tmap.Layer.Markers(); //마커 레이어 생성
          map.addLayer(markerLayer); //map에 마커 레이어 추가
          var size = new Tmap.Size(26, 30); //아이콘 크기 설정
          var offset = new Tmap.Pixel(-(size.w / 2), -size.h); //아이콘 중심점 설정
          var prtclString = new XMLSerializer().serializeToString(prtcl); //xml to String
          var xmlDoc = window.$.parseXML(prtclString);
          window.$xml = window.$(xmlDoc);
          window.$intRate = window.$xml.find('poi');
          let locationIdArray = [];
          let station_name_html = '';

          console.log(window.$intRate);
          window.$intRate.each(function(index, element) {
            var name = element.getElementsByTagName('name')[0].childNodes[0]
              .nodeValue;
    
              let station = name.split('역');
              // 1개의역 당 출구 하나면 보이게 하기 위한 처리 
              if(locationIdArray.indexOf(station[0]) < 0){
                locationIdArray.push(station[0]);
              
              var lon = element.getElementsByTagName('noorLon')[0].childNodes[0]
                .nodeValue;
              var lat = element.getElementsByTagName('noorLat')[0].childNodes[0]
                .nodeValue;
            
            let station_final = element.getElementsByTagName('name')[0].textContent;
            let station_final_sub_arr = station_final.split(' ');
            console.log(station_final_sub_arr[0]);

            station_name_html = station_name_html + '<li class="list-group-item mid_station_each_list">'+station_final_sub_arr[0]+'</li>';
              
              var icon = new Tmap.Icon(
                locationIcon,
                size,
                offset
              );
              var lonlat = new Tmap.LonLat(lon, lat); //좌표설정
              var marker = new Tmap.Marker(lonlat, icon); //마커생성
              markerLayer.addMarker(marker); //마커레이어에 마커 추가

              //마커 이벤트등록
              let markerInfo;
              marker.events.register('click',  markerInfo,onOverMarker);
              //마커에 마우스가 오버되었을 때 발생하는 이벤트 함수
              function onOverMarker(evt) {
                  let station_str = name.split('역');
                  let station_name = station_str[0]+'역';
                  $('#map_searchResult').text('선택하신 장소는 \''+station_name+'\' 입니다.');
                  $('#input_location').val(station_name);
                  midHandleFormSubmit(station_name);
              }
            }
          });
          
          map.zoomToExtent(markerLayer.getDataExtent()); //마커레이어의 영역에 맞게 map을 zoom
          map.zoomTo(15);
          $('.sel_mid_station_text').html(station_name_html);
        }
        // 근접 역 없는 경우
        else{
          let location = new window.Tmap.LonLat(_lon, _lat).transform(
            'EPSG:4326',
            'EPSG:3857'
          )

          // 2. 기존 마커, 팝업 제거
          if (markerLayer != null) {
            markerLayer.clearMarkers();
            map.removeAllPopup();
          }

          // 3. POI 마커 표시
          markerLayer = new Tmap.Layer.Markers(); //마커 레이어 생성
          map.addLayer(markerLayer); //map에 마커 레이어 추가
          let size = new Tmap.Size(26, 30); //아이콘 크기 설정
          let offset = new Tmap.Pixel(-(size.w / 2), -size.h); //아이콘 중심점 설정

          let icon = new Tmap.Icon(
            locationIcon,
            size,
            offset
          );
          let lonlat = new Tmap.LonLat(location.lon, location.lat); //좌표설정
          let marker = new Tmap.Marker(lonlat, icon); //마커생성
          markerLayer.addMarker(marker); //마커레이어에 마커 추가

          // map.zoomToExtent(markerLayer.getDataExtent()); //마커레이어의 영역에 맞게 map을 zoom
          map.setCenter(new Tmap.LonLat(_lon, _lat).transform("EPSG:4326", "EPSG:3857"), 13);	
          let msg = '아래는 중간지점 입니다.';
          $('#map_sub_searchResult').text('근접 역이 존재하지 않습니다. 만나고 싶은 위치를 입력해주세요.');
          $('#map_searchResult').text(msg);
        }
      },
      //요청 실패시 콘솔창에서 에러 내용을 확인
      error: function(request, status, error) {
        console.log(
          'code:' +
            request.status +
            '\n' +
            'message:' +
            request.responseText +
            '\n' +
            'error:' +
            error
        );
      },
    });
  }

  // '설정' 버튼을 누른 경우
  handleFormSubmit = () =>{
    // 만날 장소를 입력한 경우
    if(this.checkInputDirectLocation() === true) {
      this.props.setNextMeetingLocation(this.state.mid_direct_input_loc);
      this.setScheduleConfirm();
    }
    // 만날 장소를 입력하지 않은 경우
    else {
      // '장소를 다시 지정해주세요.' 모달창
      this.inputRightLocationConfirm();
    }
  };

  handleValueChange = e => {
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  };

  midHandleFormSubmit = (location) =>{
    this.props.setNextMeetingLocation(location);
    this.setScheduleConfirm();
  };

  // 스케줄 등록 확인 문구
  setScheduleConfirm = () => {
    confirmAlert({
        message: '상단의 일자와 장소를 확인 후, 하단의 일정추가 버튼을 눌러주세요.',
        buttons: [
        {
            label: '확인'
        }]
    })        
  }

  // 중심 좌표로 set
  showCenter = () =>{
    var lonlat = new Tmap.LonLat(this.props.lon, this.props.lat).transform("EPSG:4326", "EPSG:3857");//좌표 설정
    this.state.map.panTo(lonlat);   //해당 좌표로 map을 부드럽게 이동
  }

  // 추출한 중간 지점에 근접한 역 입력 유무 판단
  checkInputDirectLocation = () => {
    let btn_mid_sel_direct_input = this.state.mid_direct_input_loc;
    if(btn_mid_sel_direct_input !== '') {
      return true;
    }
    else {
      return false;
    }
  }

  // '장소를 다시 지정해주세요.' 모달창
  inputRightLocationConfirm = () => {
    confirmAlert({
      message: '장소를 다시 지정해주세요.',
      buttons: [
        { 
        label: '확인'
        }],
      });
  }

  render() {
    return (
      <React.Fragment>
        <div className="center">
          <div id="map_info_div" name="map_info_div">
            <div id="map_searchResult" name="searchResult"></div>
            <div id="map_sub_searchResult" name="sub_searchResult">
              이외의 장소에서 만나시길 원하시면 <br className="map_sub_desc_br"/>
              입력란에 입력 해주세요.
            </div>
            <div className = "sel_mid_direct_div">
                <input
                  type="text"
                  className="form-control"
                  id="sel_mid_direct_input_search"
                  placeholder="만날 장소"
                  name="mid_direct_input_loc"
                  value={this.state.mid_direct_input_loc}
                  onChange={this.handleValueChange}
                />
                <input
                  type="button"
                  value="설정"
                  className="btn btn-outline-primary"
                  id="btn_mid_sel_direct_input"
                  onClick = {this.handleFormSubmit}
                />
                <input 
                  type="button" 
                  className="btn btn-outline-primary"
                  id="btn_show_center" 
                  onClick={this.showCenter} 
                  value="중심으로"
                />
            </div>
            <div className="mid_final_desc">
              아래 지도를 통해 만날 장소를 입력하신 후, 
              <br className="mid_final_desc_br"/>'설정' 버튼을 눌러주세요.
            </div>
          </div>
        </div>
        <div id="map_div"></div>
        <div className="mid_station_list_div">
          <ul className="list-group mid_station_list">
            <div className="sel_mid_station_text"></div>
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

export default Map;
