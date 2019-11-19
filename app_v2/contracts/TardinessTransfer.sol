pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract TardinessTransfer {
    // 지각에 따른 ether 차감 구조체 
    struct tardinessTransfer {
        bytes32 senderId; 
        bytes32 sendName; 
        bytes32 receiverid; 
        bytes32 receiverName;
        uint coin; 
        bytes32 date; 
        bytes32 idx_hash;
    }

    // 해당 Study Group의 특정 스터디원의 지각 거래 내역
    mapping(uint => tardinessTransfer[]) tardinessTransferList;

    // 지각에 대한 코인 차감 거래 발생
    function setTardinessTransfer(bytes32 _senderId, bytes32 _senderName, bytes32 _receiverid, bytes32 _receiverName, uint _coin, bytes32 _date, uint _study_id, address _receiverAddress, bytes32 _idx_hash) public payable {
        tardinessTransfer memory transferItem = tardinessTransfer(_senderId,_senderName, _receiverid, _receiverName, _coin, _date, _idx_hash); 
        tardinessTransferList[_study_id].push(transferItem); 
        _receiverAddress.transfer(msg.value);
    }

    // 지각에 대한 ether 차감 거래 발생 정보 얻기 
    function getTardinessTransfer (uint _study_id) view external returns(tardinessTransfer[],uint) {
        tardinessTransfer[] memory transferList = tardinessTransferList[_study_id]; 
        return (transferList,transferList.length);
    }
}
