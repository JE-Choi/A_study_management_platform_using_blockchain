import React, { Component } from 'react';
// import './CoinManagement.css';
import { post } from 'axios';
import $ from 'jquery';
import ProgressBar from './ProgressBar';


// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 

class EndDateReturnCoin extends React.Component {
    componentDidMount(){
        let hour = 1000*60*60; // 1시간
        let minutes = 1000*60; // 1분
        let interval_time = minutes * 1; // 12시간


        setInterval(function() { 
            let today = new Date();
            let c_year = today.getFullYear();
            let c_month = today.getMonth() + 1;
            let c_date = today.getDate();

            // let day = 
            let  c_hour = today.getHours();
            let c_min = today.getMinutes();
            let c_sec = today.getSeconds(); 
            document.write(c_hour+":"+c_min+":"+c_sec+"<br/>");
            // if (c_hour >8 && c_hour <21 ) 
            // {
            // document.write('내용1'); // 08시부터 21시 이전까지 실행되는 내용
            // }
            // else
            // {
            // document.write('내용2'); // 21시부터 아침 08시 이전까지 실행
            // }

        }, interval_time);
        
    }

    startEndStudyScan = () =>{
       
        this.callEndDateReturnCoin('2019-06-18').then((res)=>{
            // 종료일자가 오늘 날짜인것들이 쿼리 결과가 나옴. 
            let datas = res.data;
            if(datas.length === 0){
                console.log("진행할 거래 없음.");
            } else{
                for(let i = 0; i<datas.length;i++){
                    this.processEndDate(datas,i);
                }
            }
        });
    }
    
    // 종료일자가 오늘 날짜인것들이 쿼리 결과가 나옴. 
    callEndDateReturnCoin = (_today) => {
        const url = '/api/manager/callEndDateReturnCoin';
        return post(url,  {
            today: _today
        });
    }

    // 종료날짜인 스터디에 속한 스터디원 추출
    callEndDatePerson = (_study_id) => {
        const url = '/api/manager/callEndDatePerson';
        return post(url,  {
            study_id: _study_id
        });
    }

    // callEndDateReturnCoin, callEndDatePerson 쿼리문 처리 부분
    // study_id, person_id StudyGroup.sol에서 사용자 정보 구조체 조회 시 사용
    // StudyGroup.sol 거래 내역 추가시킬 때 사용
    processEndDate(datas,i){
        let s_id = datas[i].s_id;
        console.log(s_id);
        console.log(datas[i].study_name);
        console.log(datas[i].study_type);
        console.log(datas[i].study_coin);

        // 종료날짜인 스터디에 속한 스터디원 추출
        this.callEndDatePerson(s_id).then((res)=>{
            let personDate = res.data;
            for(let j = 0; j < personDate.length; j++){
                this.processEndDatePersonAccount(s_id,personDate[j]);
            }
        });
    }
    // 종료날짜인 스터디에 속한 스터디원의 계좌 정보 추출
    callEndDatePersonAccount = (_study_id, _person_id) => {
        const url = '/api/manager/callEndDatePersonAccount';
        return post(url,  {
            study_id: _study_id,
            person_id: _person_id
        });
    }

    // callEndDatePersonAccount 쿼리 처리
    // account_index -> 잔액 반환에 이용
    processEndDatePersonAccount (_s_id,data){
        this.callEndDatePersonAccount(_s_id, data.person_id).then((res)=>{
            console.log(res.data);
            let personAccount = res.data;
            for(let n = 0; n< personAccount.length; n++){
                let account_index = personAccount[n].account_index;
                console.log(account_index);
            }
            
        });
    }
    

    render() {
        return (
        <div>
             <div>오늘 종료된 스터디가 있는지</div>
                <input type="button" value="스터디 스캔" onClick={this.startEndStudyScan}/>
        </div>
            
        )
    }
}


export default EndDateReturnCoin;