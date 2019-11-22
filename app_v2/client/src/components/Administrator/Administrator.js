import React, { Component } from 'react';
import './styles.css';
import MainAccountItem from './items/MainAccountItem';
import AttendanceCheckItem from './items/AttendanceCheckItem';
import QuizItem from './items/QuizItem';
import StudyEndItem from './items/StudyEndItem';
import { post } from 'axios';
import loadMainAccount from './load/loadMainAccount';
import loadAttendanceCheck from './load/loadAttendanceCheck';
import loadQuiz from './load/loadQuiz';
import loadStudyEnd from './load/loadStudyEnd';
import ProgressBarBackGround from '../../utils/ProgressBar/ProgressBarBackGround';

class Administrator extends Component{
  constructor(props) {
    super(props);
    this.state = {
        studyitem :null,
        personItems:null,
        mainAccountTransfer:null,
        transactions_list:null,
        quiz_list:null,
        end_list:null,
        all_transactions: null,
        is_progress : false
    }
}

componentDidMount = async() =>{
  this.callAllStudyitem().then((res)=>{
    let data = res.data;
    this.setState({
      studyitem : data
    });
    this.callAllPersons().then((res)=>{
      let data = res.data;
      this.setState({
        personItems: data
      });
    });
  });
}

callStudyAllInfo = (person_id) =>{
    const url = '/api/select/main_account_list/ConfirmInformation';
    return post(url,  {
        person_id: person_id
    });
  }

callAllStudyitem = async () => {
    const url = '/api/select/all_studyitem';
    return post(url);
}

callAllPersons = async () => {
  const url = '/api/select/allPerson_info';
  return post(url);
}

loadMainAccount = async ()=>{
  this.setState({
    is_progress: true
  });
  loadMainAccount.run(this.state.personItems).then((_mainAccountTransfer)=>{
    let mainAccountTransfer = [];
    if(_mainAccountTransfer === false){
      this.loadMainAccount();
    } else {
      for(let i = 0 ; i < _mainAccountTransfer.length; i++){
        for(let j = 0; j<_mainAccountTransfer[i].length; j++){
          mainAccountTransfer.push(_mainAccountTransfer[i][j]);
        }
      }
      this.setState({
        mainAccountTransfer: mainAccountTransfer.sort((a,b) => b[0] - a[0]),
        transactions_list:null,
        quiz_list:null,
        end_list:null,
        all_transactions:null,
        is_progress: false
      });
    }
  });
}

loadAttendanceCheck = async ()=>{
  this.setState({
    is_progress: true
  });
  loadAttendanceCheck.run(this.state.studyitem).then((_transactions_list)=>{
    console.log(_transactions_list);
    if(_transactions_list === false){
      console.log(_transactions_list);
      this.loadAttendanceCheck();
    } else {
      console.log(_transactions_list.sort((a,b) => b[0] - a[0]));
      this.setState({
        mainAccountTransfer:null,
        transactions_list: _transactions_list.sort((a,b) => b[0] - a[0]),
        quiz_list:null,
        end_list:null,
        all_transactions:null,
        is_progress: false
      });
    }
  });
}

loadQuiz = async ()=>{
  this.setState({
    is_progress: true
  });
  loadQuiz.run(this.state.studyitem).then((_quiz_list)=>{
    console.log(_quiz_list);
    if(_quiz_list === false){
      this.loadQuiz();
    } else {
      console.log(_quiz_list);
      this.setState({
        mainAccountTransfer:null,
        transactions_list:null,
        quiz_list: _quiz_list.sort((a,b) => b[0] - a[0]),
        end_list:null,
        all_transactions:null,
        is_progress: false
      });
   }
  });
}

loadStudyEnd = async () =>{
  this.setState({
    is_progress: true
  });
  loadStudyEnd.run(this.state.studyitem).then((_end_list)=>{
    console.log(_end_list);
    if(_end_list === false){
      this.loadStudyEnd();
    } else {
      this.setState({
        mainAccountTransfer:null,
        transactions_list:null,
        quiz_list:null,
        end_list: _end_list.sort((a,b) => b[0] - a[0]),
        all_transactions:null,
        is_progress: false
      });
    }
    
  });
}

sort_array = (array, index, is_json, content) =>{
  // json파일 인지 검사.
  if(is_json === true){
    for(let i = 0; i < array.length; i++){
      let date = new Date(array[i][index].date+' 00:00:01');
      array[i].splice(0,0,date);
      array[i].splice(1,0,content);
    }
    return array.sort((a,b) => b[0] - a[0]);
  } else{
    for(let i = 0; i < array.length; i++){
      let date = new Date(array[i][index]+' 00:00:01');
      array[i].splice(0,0,date);
      array[i].splice(1,0,content);
    }
    return array.sort((a,b) => b[0] - a[0]);
  }
  
}

loadAll = async () =>{
  this.setState({
    mainAccountTransfer:[],
    transactions_list:[],
    quiz_list:[],
    end_list:[],
    all_transactions:[],
    is_progress: true
  });
  let all_transactions = [];
  loadMainAccount.run(this.state.personItems).then((_mainAccountTransfer)=>{
    let mainAccountTransfer = [];
    let sum = 0;
    console.log(_mainAccountTransfer);
    if(_mainAccountTransfer !== false){
      for(let i = 0 ; i < _mainAccountTransfer.length; i++){
        for(let j = 0; j<_mainAccountTransfer[i].length; j++){
          mainAccountTransfer.push(_mainAccountTransfer[i][j]);
        }
      }
      sum = sum + mainAccountTransfer.length;
      mainAccountTransfer = mainAccountTransfer.sort((a,b) => b[0] - a[0]);
      loadAttendanceCheck.run(this.state.studyitem).then((_transactions_list)=>{
        let transactions_list= [];
        if(_transactions_list !== false){
          transactions_list= _transactions_list.sort((a,b) => b[0] - a[0]);
          sum = sum + transactions_list.length;
  
          loadQuiz.run(this.state.studyitem).then((_quiz_list)=>{
            let quiz_list = [];
            if(_quiz_list !== false){ 
              quiz_list = _quiz_list.sort((a,b) => b[0] - a[0]);
              sum = sum + quiz_list.length;
              loadStudyEnd.run(this.state.studyitem).then((_end_list)=>{
                let end_list = [];
                if(_end_list !== false){
                  end_list = _end_list.sort((a,b) => b[0] - a[0]);
                  sum = sum + end_list.length;
                  console.log(sum);
                } else {
                  this.loadAll();
                }
                
                all_transactions = all_transactions.concat(end_list);
                all_transactions = all_transactions.concat(quiz_list);
                all_transactions = all_transactions.concat(transactions_list);
                all_transactions = all_transactions.concat(mainAccountTransfer);
                console.log(all_transactions);
                console.log('all_transactions: ',all_transactions.length);
                all_transactions.sort((a,b) => b[0] - a[0]);
                this.setState({
                  all_transactions:all_transactions,
                  is_progress: false
                });
              });
            } else {
              this.loadAll();
            }
          });
        } else {
          this.loadAll();
        }
      });
    } else {
      this.loadAll();
    }
  });
}

  render(){
    return(
      <div className="pageBackgroundColor">
        <div className="admin_container">
          <div className="transactions_header_div">
            <span className="txns_header">
                All Transactions
            </span>
          </div>
          <ul className = "list-group list-group-horizontal">
              <li className = "list-group-item tnx_menu" onClick = {this.loadAll}>전체</li>
              <li className = "list-group-item tnx_menu" onClick = {this.loadMainAccount}>본 계좌</li>
              <li className = "list-group-item tnx_menu" onClick = {this.loadAttendanceCheck}>출석체크</li>
              <li className = "list-group-item tnx_menu" onClick={this.loadQuiz}>퀴즈</li>
              <li className = "list-group-item tnx_menu" onClick = {this.loadStudyEnd}>종료</li>
            </ul>
          <div className="transactions_content_div">
            <ul class="list-group list-group-horizontal txn_lbl">
              <li class="list-group-item detail_lbl">Date</li>
              <li class="list-group-item detail_lbl">From</li>
              <li class="list-group-item detail_lbl">To</li>
              <li class="list-group-item detail_lbl">Content</li>
              <li class="list-group-item detail_lbl">Value</li>
            </ul>
            {this.state.mainAccountTransfer ? this.state.mainAccountTransfer.map(c => {
                  return (
                    <MainAccountItem 
                    data = {c}/>
                  )
              })
            : ""}
            {this.state.transactions_list ? this.state.transactions_list.map(c => {
                  return (
                    <AttendanceCheckItem 
                    data = {c}/>
                  )
              })
            : ""}
            {this.state.quiz_list ? this.state.quiz_list.map(c => {
                  return (
                    <QuizItem 
                    data = {c}/>
                  )
              })
            : ""}
            {this.state.end_list ? this.state.end_list.map(c => {
              return (
                <StudyEndItem 
                data = {c}/>
              )
              })
            : ""}
            {this.state.all_transactions ? this.state.all_transactions.map(c => {
              if(c[1] === 'StudyEnd'){
                return (
                  <StudyEndItem 
                  data = {c}/>
                )
              } 
              else if(c[1] === 'Quiz'){
                return (
                  <QuizItem 
                  data = {c}/>
                )
              }
              else if(c[1] === 'AttendanceCheck'){
                return (
                  <AttendanceCheckItem 
                  data = {c}/>
                )
              }
              else if(c[1] === 'MainAccount'){
                return (
                  <MainAccountItem 
                  data = {c}/>
                )
              }
              })
            : ""}
          </div>
          {this.state.is_progress === true ?
          <ProgressBarBackGround 
              message = "거래 데이터 로드 중..." 
              sub_msg1="잠시만 기다려 주세요."/>
          : ""}
          
        </div>
      </div>
    );
  }
}

export default Administrator