pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract MainAccountTransfer {
    // 본 계좌 거래 내역 구조체
    struct mainAccountTransfer {
        bytes32 destination; 
        bytes32 startingPoint; 
        bytes32 date; 
        bytes32 content; 
        uint etherNum; 
        bytes32 idx_hash;
        bytes32 time; 
    }
    
    // 본 계좌의 거래 내역 리스트 
    mapping(address => mainAccountTransfer[]) mainAccountTransferList;
    
    // 본 계좌의 거래 내역을 저장
    function setMainAccountTransfer (address personAddress, bytes32 destination,bytes32 startingPoint,
    uint etherNum, bytes32 date, bytes32 content, address receiverAddress, bytes32 _idx_hash, bytes32 _time) public payable{
        receiverAddress.transfer(msg.value);
        mainAccountTransfer memory mainAccountTransferItem
             = mainAccountTransfer(destination, startingPoint, date, content, etherNum, _idx_hash, _time); 
        mainAccountTransferList[personAddress].push(mainAccountTransferItem);
    }

    // 본 계좌 거래 내역 반환
    function getMainAccountTransfer(address personAddress) view external returns(mainAccountTransfer[]) {
        return (mainAccountTransferList[personAddress]);
    }
}
