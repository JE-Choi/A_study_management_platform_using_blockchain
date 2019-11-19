pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract AboutStudyInfo{
    // 스터디 그룹 생성시 스터디 정보 저장
    struct aboutStudyInfo {
        bytes32 endDate; 
        uint study_cnt; 
    }
    mapping(uint => aboutStudyInfo) studyInfoList;

    // Study Group의 종료 저장
    function setStudyInfo(uint _studyId, bytes32 _endDate, uint _study_cnt) public {
        aboutStudyInfo memory aboutStudyInfoItem
             = aboutStudyInfo(_endDate, _study_cnt); 
        studyInfoList[_studyId] = aboutStudyInfoItem;
    }

    // Study Group 구조체 반환 
    function getStudyInfo(uint _studyId) view external returns(aboutStudyInfo) {
        return (studyInfoList[_studyId]);
    }
}
