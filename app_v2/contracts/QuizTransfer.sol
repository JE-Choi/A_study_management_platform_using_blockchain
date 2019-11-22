pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract QuizTransfer {
    // Study Group 퀴즈 내역 구조체
    struct studyQuizTransfer {
        bytes32 senderId; 
        bytes32 sendName; 
        bytes32 receiverid;
        bytes32 receiverName; 
        uint coin; 
        bytes32 date; 
        bytes32 idx_hash;
        bytes32 time; 
    }

    // 해당 스터디의 특정 스터디원의 퀴즈 거래 내역
    mapping(uint => studyQuizTransfer[]) studyQuizTransferList;

    // 퀴즈에 대한 코인 차감 거래 발생
    function setStudyQuizTransfer(bytes32 _senderId,  bytes32 _senderName, bytes32 _receiverid, bytes32 _receiverName, uint _coin, bytes32 _date, uint _study_id, address _receiverAddress, bytes32 _idx_hash, bytes32 _time) public payable {
        studyQuizTransfer memory transferItem 
        = studyQuizTransfer(_senderId,_senderName, _receiverid, _receiverName, _coin, _date, _idx_hash, _time); 

        studyQuizTransferList[_study_id].push(transferItem); 
        // 실제 ether 거래 발생
        _receiverAddress.transfer(msg.value);
    }

    // 퀴즈에 대한 ether 차감 거래 발생 정보 얻기 
    function getStudyQuizTransfer (uint _study_id) view external returns(studyQuizTransfer[],uint) {
        studyQuizTransfer[] memory transferList = studyQuizTransferList[_study_id];
        return (transferList,transferList.length);
    }
}
