import Point from '@studiomoniker/point';
import _ from 'lodash';

const CenterOfGravity = {
    pointArray: [], // 포인터 배열
    centerPoint: null, // 무게중심 위치
  
  addPoint: function(coordinateArray) {
    let pointArray = _.cloneDeep(CenterOfGravity.pointArray);
    for(let i = 0; i < coordinateArray.length; i++){
        let p = new Point(Number(coordinateArray[i][0].lon), Number(coordinateArray[i][1].lat));
        pointArray.push(p);
    }
    return pointArray;
  },

  centerOfLine: function(pointArray) {
    if (CenterOfGravity.centerPoint !== null) {
        return CenterOfGravity.centerPoint;
      }
  
      let xPos_center = 0.0;
      let yPos_center = 0.0;
      let firstPoint, secondPoint;
  
      CenterOfGravity.centerPoint= new Point();
  
      // index로 Point 배열에 접근해서 Point를 반환받아 저장
      firstPoint = pointArray[0];
      secondPoint = pointArray[1];
  
      // 두 좌표 사이의 중심값
      xPos_center = (firstPoint.x + secondPoint.x) / 2;
      yPos_center = (firstPoint.y + secondPoint.y) / 2;
  
      let m_centerPoint = new Point(xPos_center, yPos_center);
 
      return m_centerPoint;
  },

  centerOfGravityOfPolygon: function(pointArray) {
    if (CenterOfGravity.centerPoint !== null) {
        return CenterOfGravity.centerPoint;
      }
  
      let xPos_center = 0.0;
      let yPos_center = 0.0;
      let area = 0.0;
  
      CenterOfGravity.centerPoint= new Point();

      let firstIdx, secondIdx;
      let sizeOfVertexs = pointArray.length;
  
      let firstPoint, secondPoint;
      let factor = 0;
  
      // addPoint된 점 개수만큼 반복
      for (firstIdx = 0; firstIdx < sizeOfVertexs; firstIdx++) {
        secondIdx = (firstIdx + 1) % sizeOfVertexs;
  
        // index로 Point 배열에 접근해서 Point를 반환받아 저장
        firstPoint = pointArray[firstIdx];
        secondPoint = pointArray[secondIdx];
  
        factor = firstPoint.x * secondPoint.y - secondPoint.x * firstPoint.y;
        area += factor;
  
        xPos_center += (firstPoint.x + secondPoint.x) * factor;
        yPos_center += (firstPoint.y + secondPoint.y) * factor;
      }
      area /= 2.0;
      area *= 6.0;
  
      factor = 1 / area;
  
      xPos_center *= factor;
      yPos_center *= factor;
  
      let m_centerPoint = new Point(xPos_center, yPos_center);
  
      return m_centerPoint;
  },

  // 무게중심 계산하는 대표 함수
  getCenterPoint: function(coordinateArray) {
    CenterOfGravity.centerPoint = null;
    let pointArray = CenterOfGravity.addPoint(coordinateArray);

    // 스터디 원의 인원 수가 두 명인 경우
    if (pointArray.length === 2) {
     CenterOfGravity.centerPoint = CenterOfGravity.centerOfLine(pointArray);
    }
    // 스터디 원의 인원 수가 세 명 이상인 경우
    else {
        CenterOfGravity.centerPoint = CenterOfGravity.centerOfGravityOfPolygon(pointArray);
    }
    return CenterOfGravity.centerPoint;
  },
};

export default CenterOfGravity;
