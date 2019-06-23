pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;
contract StudyGroup {

    // 스터디원 구조체
    struct studyMember {
        address memberAddress; // 계좌번호
        bytes32 person_id; // solidity는 string에 최적화되어 있지 않고, bytes32에 최적화
        uint study_id;// 가입할 study_id
        bytes32 person_name; // 사용자 이름
    }

    // 스터디 구조체
    struct studyInfo { 
        bytes32 endDate;    //스터디 종료날짜
        bool isEndDateDeal; //스터디 종료 거래 진행 여부
    }

   // 스터디 퀴즈내역 저장
    struct studyQuizTransfer {
        bytes32 senderId; // 지각한 사람의 person_id
        bytes32 sendName; // 지각한 사람의 person_name
        bytes32 receiverName; // 받는 사람의 person_name
        uint coin; // 지각할 때 빠져나갈 코인
        bytes32 date; // 지각한 날짜
    }

    // 스터디 종료내역 저장
    struct studyEndTransfer {
        uint studyId;// 종료된 study_id
        bytes32 personId; // 반환 받아야 하는 person_id
        bytes32 personName; // 반환 받아야 하는 person_name
        uint receiveEther; // 반환 받아야 하는 ether값
        bytes32 endDate; // 종료된 날짜
    }
    
    // 지각에 따른 코인 차감
    struct tardinessTransfer {
        bytes32 senderId; // 지각한 사람의 person_id
        bytes32 sendName; // 지각한 사람의 person_name
        bytes32 receiverName; // 받는 사람의 person_name
        uint coin; // 지각할 때 빠져나갈 코인
        bytes32 date; // 지각한 날짜
    }
    // 스터디원 배열
    // memberInfo 는 uint 타입인 스터디 id에서 bytes32 타입인 person_id로 값을 얻는데, 
    // 그 값이 studyMember에 매칭되는 회원 정보
    // 스터디 가입, 생성시 회원 정보 저장.
    mapping(uint => mapping(bytes32 => studyMember)) memberInfo;

    // (key, value) = ( [스터디id][사용자id] -> 지각거래 내역)
    // 해당 스터디의 특정 스터디원의 지각 거래 내역
    mapping(uint => tardinessTransfer[]) getTardinessTransferList;
    //mapping(uint => mapping(uint => LogOfTardinessTransfer)) LogOfTardinessTransfer_mapping;

    // (key: 스터디 id) 스터디 생성시 스터디 정보 저장
    mapping(uint => studyInfo) studyInfoList;

    // (스터디별) 스터디 종료 트랜잭션 
    mapping(uint => studyEndTransfer[]) studyEndTransferList;
    // (모든 스터디) 스터디 종료 트랜잭션 
    studyEndTransfer[] studyEndManageList;

    // (key, value) = ( [스터디id][사용자id] -> 퀴즈거래 내역)
    // 해당 스터디의 특정 스터디원의 퀴즈 거래 내역
    mapping(uint => studyQuizTransfer[]) studyQuizTransferList;

    // studyGroup.sol에 스터디 종료 여부, 종료 내역 저장
    function setStudyEndTransfer(uint _studyId, bytes32 _endDate) public {
        // 스터디 구조체 생성
        studyInfo memory studyInfoItem = studyInfo(_endDate, false); 
        // 스터디 정보 list에 항목 추가
        studyInfoList[_studyId] = studyInfoItem;
    }

    // 스터디 정보 반환
    function getStudyEndTransfer(uint _studyId) view external returns(studyInfo) {
        // 스터디 구조체 반환
        return (studyInfoList[_studyId]);
    }

    // (전체)스터디 정보 반환
    function getStudyEndTransferManageList() view external returns(studyEndTransfer[]) {
        // 스터디 구조체 반환
    
        return (studyEndManageList);
    }

    // (인덱스)스터디 정보 반환
    function getStudyEndTransferList(uint _study_id) view external returns(studyEndTransfer[]) {
        // 스터디 구조체 반환
        return (studyEndTransferList[_study_id]);
    }

    // 스터디 종료처리 - (스터디 구조체에 isEndDateDeal 항목 수정)
    function renameStudyEndTransfer(uint _studyId) public {
        studyInfoList[_studyId].isEndDateDeal = true;
    }
    
    // study가 종료될 때 코인을 환급받는 메소드
    function endTheStudy(uint _studyId, bytes32 _personId, uint _receiveEther,  bytes32 _endDate) external payable {

        // 종료 거래 생성 및 리스트에 추가
        bytes32 _personName = memberInfo[_studyId][_personId].person_name;
        // 종료 거래 생성
        studyEndTransfer memory studyEndTransferItem = studyEndTransfer(_studyId, _personId, _personName, _receiveEther, _endDate);
        
        // 리스트에 추가
        studyEndTransferList[_studyId].push(studyEndTransferItem);
        studyEndManageList.push(studyEndTransferItem);

        // 사용자 계좌에서 관리자 계좌로 거래 진행
        address managerAccount = 0x6A514E7125B87a7ca5Eb230abD9E02EEbb3D678E;
        // sender는 js파일에서 지정됨.
        // managerAccount는 receiver
        managerAccount.transfer(msg.value);
    }
    
    // 지각에 대한 코인 차감 거래 발생
    function setTardinessTransfer(bytes32 _senderId, bytes32 _receiverId, uint _coin, bytes32 _date, uint _study_id) public payable {
        studyMember memory senderInfo = memberInfo[_study_id][_senderId];
        studyMember memory receiverInfo = memberInfo[_study_id][_receiverId];
        // 메세지 저장할 객체 생성
       tardinessTransfer memory transferItem = tardinessTransfer(_senderId,senderInfo.person_name, receiverInfo.person_name, _coin, _date); 
        
        // 객체에 지각한 내용 저장 - 해당 스터디에 대한 지각 정보
        getTardinessTransferList[_study_id].push(transferItem); 
        
        // 실제 거래 부분
        address receiverAddress = receiverInfo.memberAddress;
        receiverAddress.transfer(msg.value);
    }

    // 지각에 대한 코인 차감 거래 발생 정보 얻기 
    function getTardinessTransfer (uint _study_id) view external returns(tardinessTransfer[],uint) {
    // 해당 스터디의 모든 지각 정보
        tardinessTransfer[] memory transferList = getTardinessTransferList[_study_id]; // 메세지 객체 저장
        return (transferList,transferList.length);
    }

    
    // 다차원 mapping 읽음 -> 특정 스터디의 특정 회원의 회원정보를 읽음.
    function getPersonInfoOfStudy(uint _study_id, bytes32 _person_id) view external returns(studyMember) {
          return (memberInfo[_study_id][_person_id]);
    }

     // 다차원 mapping 저장 -> 특정 스터디의 특정 회원의 회원정보를 저장.
    function setPersonInfoOfStudy(uint _study_id, bytes32 _person_id, address _memberAddress, bytes32 _person_name) public payable {
        memberInfo[_study_id][_person_id] = studyMember(_memberAddress, _person_id, _study_id, _person_name);
        _memberAddress.transfer(msg.value);
    }

    // 관리자 계좌에서 가입자에게 코인 충전
    function chargeTheCoin(address _receiver) public payable {
        // _receiver에게 msg.value에서 지정된 ether만큼 전송. 
        _receiver.transfer(msg.value);
    }

    // 퀴즈에 대한 코인 차감 거래 발생
    function setStudyQuizTransfer(bytes32 _senderId, bytes32 _receiverId, uint _coin, bytes32 _date, uint _study_id) public payable {
        studyMember memory senderInfo = memberInfo[_study_id][_senderId];
        studyMember memory receiverInfo = memberInfo[_study_id][_receiverId];
        // 메세지 저장할 객체 생성
       studyQuizTransfer memory transferItem = studyQuizTransfer(_senderId,senderInfo.person_name, receiverInfo.person_name, _coin, _date); 
        
        // 객체에 퀴즈한 내용 저장 - 해당 스터디에 대한 퀴즈 정보
        studyQuizTransferList[_study_id].push(transferItem); 
        
        // 실제 거래 부분
        address receiverAddress = receiverInfo.memberAddress;
        receiverAddress.transfer(msg.value);
    }

    // 퀴즈에 대한 코인 차감 거래 발생 정보 얻기 
    function getStudyQuizTransfer (uint _study_id) view external returns(studyQuizTransfer[],uint) {
    // 해당 스터디의 모든 퀴즈 정보
        studyQuizTransfer[] memory transferList = studyQuizTransferList[_study_id]; // 메세지 객체 저장
        return (transferList,transferList.length);
    }

}
