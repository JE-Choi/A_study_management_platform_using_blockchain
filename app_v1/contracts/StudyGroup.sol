pragma solidity ^0.4.25;

contract StudyGroup {

    // 스터디원 구조체
    struct studyMember {
        address memberAddress; // 계좌번호
        bytes32 person_id; // solidity는 string에 최적화되어 있지 않고, bytes32에 최적화
        uint study_id;// 가입할 study_id
        // uint leader; // 1이면 리더
        // uint study_period; // 스터디 기간
        // 스터디 시작일자
        // 스터디 종료일자
        uint numOfCoins; // 해당 스터디 안에서 자신만의 코인
    }

    // 스터디 구조체
    struct eachStudy {
        uint study_id;
        studyMember[] members;
    }

    // 생성자 필요할까? 고민 중.

    // 스터디원 배열
    mapping(uint => mapping(uint => studyMember)) memberInfo;

    function getMemberIndexInfo(uint index) view external returns(address, bytes32, uint, uint) {
          return (memberInfo[0][index].memberAddress, memberInfo[0][index].person_id, memberInfo[0][index].study_id , memberInfo[0][index].numOfCoins);
    }
    
    function createIndexTheStudy(uint _index,address _memberAddress,bytes32 _person_id,uint _study_id, uint _numOfCoins) public {
        //memberInfo[_index] = studyMember(_memberAddress, _person_id, _study_id, _numOfCoins);
        memberInfo[0][_index] = studyMember(_memberAddress, _person_id, _study_id, _numOfCoins);
    }

    // 송금
    function transferCoin(address _sender) public payable {
        _sender.transfer(msg.value);
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
