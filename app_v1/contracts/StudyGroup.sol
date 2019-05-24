pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;
contract StudyGroup {

    // 스터디원 구조체
    struct studyMember {
        address memberAddress; // 계좌번호
        bytes32 person_id; // solidity는 string에 최적화되어 있지 않고, bytes32에 최적화
        uint study_id;// 가입할 study_id
        uint numOfCoins; // 해당 스터디 안에서 자신만의 코인
    }

    // 스터디 구조체
    struct eachStudy {
        uint study_id;
        studyMember[] members;
    }

    // 지각에 따른 코인 차감
    struct tardinessTransfer {
        bytes32 _sender; // 지각한 사람의 person_name
        bytes32 _receiver; // 받는 사람의 person_name
        uint _coin; // 지각할 때 빠져나갈 코인
        bytes32 _date; // 지각한 날짜
    }
    // 스터디원 배열
    // memberInfo 는 uint 타입인 스터디 id에서 bytes32 타입인 person_id로 값을 얻는데, 
    // 그 값이 studyMember에 매칭되는 회원 정보
    // 스터디 가입, 생성시 회원 정보 저장.
    mapping(uint => mapping(bytes32 => studyMember)) memberInfo;
    // (key, value) = ( _sender의 person_name, 그 사람의 거래 목록들)
    mapping(bytes32 => tardinessTransfer[]) getTardinessTransferList; 
    
    
    //mapping(uint => mapping(uint => LogOfTardinessTransfer)) LogOfTardinessTransfer_mapping;

    

    // 지각에 따른 코인 차감 관련 event
    // struct LogOfTardinessTransfer(
    //     address _sender,
    //     address _receiver,
    //     uint _coin,
    //     bytes32 _date
    // );
    

    // 지각에 대한 코인 차감 거래 발생
    function setTardinessTransfer(bytes32 _sender,bytes32 _receiver, uint _coin, bytes32 _date, bytes32 senderPerson_id,bytes32 receiverPerson_id, uint study_id) public payable {
        tardinessTransfer memory transferItem = tardinessTransfer(_sender, _receiver, _coin, _date); // 메세지 저장할 객체 생성
        // 지각자 처리
        uint coin_of_sender = memberInfo[study_id][senderPerson_id].numOfCoins; // 지각자의 코인
        memberInfo[study_id][senderPerson_id].numOfCoins = coin_of_sender - _coin; // 지각자의 코인 감소
        
        // 지각 아닌 사람 처리
        uint coin_of_receiver = memberInfo[study_id][receiverPerson_id].numOfCoins; // 지각아닌 사람의 코인
        memberInfo[study_id][receiverPerson_id].numOfCoins = coin_of_receiver + _coin; // 지각아닌 사람의 코인 증가
        
        // 객체에 지각한 내용 저장 
        getTardinessTransferList[_sender].push(transferItem); 
        
        // 실제 거래 부분
        address receiverAddress = memberInfo[study_id][receiverPerson_id].memberAddress;
        receiverAddress.transfer(msg.value);
    }

    // 지각에 대한 코인 차감 거래 발생 정보 얻기 
    function getTardinessTransfer (bytes32 _sender) view external returns(tardinessTransfer[],uint) {
        tardinessTransfer[] memory transferList = getTardinessTransferList[_sender]; // 메세지 객체 저장
        return (transferList,transferList.length);
    }


    // function input_tardiness_transfer(address _sender,address _receiver, uint _coin, bytes32 _date) public payable {
    //     // _receiver.transfer(msg.value);
    //     //emit log_tardiness_transfer(_sender, _receiver,_coin,_date);
    // }


    // 다차원 mapping 실험용
    // function getMemberIndexInfo(uint _study_id, bytes32 _person_id) view external returns(address, bytes32, uint, uint) {
    //       return (memberInfo[_study_id][_person_id].memberAddress, memberInfo[_study_id][_person_id].person_id, memberInfo[_study_id][_person_id].study_id , memberInfo[_study_id][_person_id].numOfCoins);
    // }

    
    // 다차원 mapping 읽음 -> 특정 스터디의 특정 회원의 회원정보를 읽음.
    function getPersonInfoOfStudy(uint _study_id, bytes32 _person_id) view external returns(studyMember) {
          return (memberInfo[_study_id][_person_id]);
    }
    
    // 다차원 mapping 저장 -> 특정 스터디의 특정 회원의 회원정보를 저장.
    function setPersonInfoOfStudy(uint _study_id, bytes32 _person_id, address _memberAddress, uint _numOfCoins) public {
        //memberInfo[_index] = studyMember(_memberAddress, _person_id, _study_id, _numOfCoins);
        memberInfo[_study_id][_person_id] = studyMember(_memberAddress, _person_id, _study_id, _numOfCoins);
    }

    // 관리자 계좌에서 가입자에게 코인 충전
    function chargeTheCoin(address _receiver) public payable {
        // _receiver에게 msg.value에서 지정된 ether만큼 전송한다. 
        _receiver.transfer(msg.value);
    }

   
    // 아래 소스 지우면 안됨. 그대로는 안쓰더라도 틀로 이용 예정임.
    // study 최초 생성자가 호출하는 메소드
    // function createTheStudy(address _memberAddress, bytes32 _person_id, uint _study_id, uint _numOfCoins) external {
        
    //     //studies.push(_study_id, studyMember(_memberAddress, _person_id, _study_id, _numOfCoins));
    //     // 계정 만드는것이 필요. -> js에서 web3로 만들고
    //     // 만든 계정(msg.sender)에 관리자 계정에서 돈 가져다가 돈 충전해주는 걸 transfer로 하기

        
    // }


    // // study 최초 생성자가 호출하는 메소드
    // function createTheStudy(address _memberAddress, bytes32 _person_id, uint _study_id, uint _numOfCoins) external payable {
        
    //     studies.push(_study_id, studyMember(_memberAddress, _person_id, _study_id, _numOfCoins));
    //     // 계정 만드는것이 필요. -> js에서 web3로 만들고
    //     // 만든 계정(msg.sender)에 관리자 계정에서 돈 가져다가 돈 충전해주는 걸 transfer로 하기

        
    //     }
    // }

    // // study에 가입하는 메소드
    // function joinTheStudy(address _memberAddress, bytes32 _person_id, uint _study_id, uint _numOfCoins) external payable {
    //     // http://blog.naver.com/PostView.nhn?blogId=blokorea&logNo=221309181242&redirect=Dlog&widgetTypeCall=true&directAccess=false
    //     int index = 0;
    //     while(_study_id < studies.length){
    //         if(_study_id == studies[index].study_id){
    //             studies[index].members.push(studyMember(_memberAddress, _person_id, _study_id, _numOfCoins));
    //             index++;
    //         }
    //     }

    //     //members.push(studyMember(_memberAddress, _person_id, _study_id, _numOfCoins));
    //     // 계정 만드는것이 필요. -> js에서 web3로 만들고
    //     // 만든 계정(msg.sender)에 관리자 계정에서 돈 가져다가 돈 충전해주는 걸 transfer로 하기

        
    //     }
    // }

    // // study 기간이 끝날 때 코인을 환급받는 메소드
    // // js에서 타이머처럼 시간 검사해서 일정시간되면 실행되는 메소드
    // // 여기에 매개변수가 있다는 건 js에서 이 함수 실행할 때 매개변수를 넘긴다는 의미.
    // function endTheStudy() external payable {
    

    // }

    // // 자신의 코인을 확인하는 메소드
    // function getNumOfCoins(uint _study_id, bytes32 _person_id) external view returns(uint) {
    //     return numOfCoins;
    // }
}
