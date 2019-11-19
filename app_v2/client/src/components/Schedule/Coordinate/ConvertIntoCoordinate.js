import $ from 'jquery';
import _ from 'lodash';
import dotenv from "dotenv";
dotenv.config();
declare var Tmap: any;

const ConvertIntoCoordinate = {
  lon: 0, // lon 좌표값
  lat: 0, // lat 좌표값
  name: null, // 지하철 명칭
  coordinateArray: [], // 결과값 배열
  station_length: 0,
  check_station_length: 0,
  nameArray:[],

  clear: function() {
    ConvertIntoCoordinate.nameArray = [];
    ConvertIntoCoordinate.coordinateArray = [];
    ConvertIntoCoordinate.station_length = 0;
    ConvertIntoCoordinate.check_station_length = 0;
  },
  
  extractCoordinate: function(station) {
    let tData = new window.Tmap.TData();

    station &&
    station.map(value => {
      tData.events.register(
        'onComplete',
        tData,
        ConvertIntoCoordinate.onComplete
      );
      console.log(value);
      ConvertIntoCoordinate.onComplete(value).then((is_end)=>{
        if(is_end === true){
          console.log(value+"추출 완료");
        }
      });
      ConvertIntoCoordinate.station_length = station.length;
    });
  },

  onComplete: async function(value) {
    var gAppKey = process.env.REACT_APP_API_KEY2; // 실행을 위한 키
    var url = process.env.REACT_APP_API_CONVERT_URL; //명칭(POI) 통합검색 API 요청 url
   
    var params = {
      version: '1', //버전 정보
      searchKeyword: value, //자동완성 키워드로 얻은 명칭 중 하나
      appKey: gAppKey, 
    };

    return new Promise(function (resolve, reject){ 
        //위에서 설정한 정보를 통하여 api 요청을 보내고, 정보 받기
        $.get(url, params, function(data) {
          if (data) {

            let lon = data.searchPoiInfo.pois.poi[0].noorLon; //data에서 받아온 lon 좌표값
            let lat = data.searchPoiInfo.pois.poi[0].noorLat; //data에서 받아온 lat 좌표값
            let name = data.searchPoiInfo.pois.poi[0].name; //data에서 받아온 명칭
            let length = ConvertIntoCoordinate.check_station_length;

            console.log('get: ',lon,lat,name);
              if(length ===  0){  
                  ConvertIntoCoordinate.check_station_length = ConvertIntoCoordinate.check_station_length +1;
                  ConvertIntoCoordinate.submitCoordinates(lon, lat, name).then((is_end)=>{
                    if(is_end === true){
                      resolve(true);
                    }
                  });
              } else if(length >= 1){
                if(ConvertIntoCoordinate.nameArray.indexOf(name) < 0){
                  ConvertIntoCoordinate.check_station_length = ConvertIntoCoordinate.check_station_length +1;
                  ConvertIntoCoordinate.submitCoordinates(lon, lat, name).then((is_end)=>{
                    if(is_end === true){
                      resolve(true);
                    }
                  });
                }
              } 
          }
        });
    });
  },

  // lon 좌표값, lat 좌표값, 지하철 명칭 전달
  submitCoordinates: async function(lon, lat, name) {
    return new Promise(function (resolve, reject){
      let coordinateArray = _.cloneDeep(ConvertIntoCoordinate.coordinateArray);
      let coordinateSubArray = [];
      ConvertIntoCoordinate.nameArray.push(name);
  
      coordinateSubArray.push({ lon: lon }); // lon 좌표값
      coordinateSubArray.push({ lat: lat }); // lat 좌표값
      coordinateSubArray.push({ station_name: name }); // 지하철 명칭
  
      coordinateArray.push(coordinateSubArray); // 좌표 배열에 추가
      ConvertIntoCoordinate.coordinateArray = _.cloneDeep(coordinateArray);
  
      // 확인용 콘솔
      console.log(ConvertIntoCoordinate.nameArray);
      console.log(ConvertIntoCoordinate.coordinateArray);
      let length = ConvertIntoCoordinate.coordinateArray.length;
      console.log(length+': '+name);
      resolve(true);
    });
  },
};

export default ConvertIntoCoordinate;
