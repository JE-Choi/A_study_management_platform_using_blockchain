pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract StudyEndTransfer {
    // 하나의 Study Group 종료 내역 저장 구조체
    struct studyEndTransfer {
        bytes32 personId; 
        bytes32 personName; 
        uint receiveEther; 
        bytes32 endDate; 
        bytes32 idx_hash;
    }
    
    // (Study Group 별) 하나의 Study Group 최종 종료 거래 내역 
    mapping(uint => studyEndTransfer[]) studyEndTransferList;

    // Study Group의 정보 반환
    function getStudyEndTransferList(uint _study_id) view external returns(studyEndTransfer[]) {
        return (studyEndTransferList[_study_id]);
    }
    
    // Study Group 최종 종료 거래 생성
    function endTheStudy(uint _studyId, bytes32 _personId, bytes32 _personName, uint _receiveEther,  bytes32 _endDate, bytes32 _idx_hash) external payable {
        studyEndTransfer memory studyEndTransferItem = studyEndTransfer (_personId, _personName, _receiveEther, _endDate, _idx_hash);
        studyEndTransferList[_studyId].push(studyEndTransferItem);
    }
}
