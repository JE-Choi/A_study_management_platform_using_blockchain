import React, { Component } from 'react';
import './MainPage.css';
import StudyItem from './StudyItem';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: "",
      completed: 0,
      isLogin: 0
    }
  }

  // state를 초기화
  stateRefresh = () => {
    this.setState({
      customers: "",
      completed: 0
    });
    // 고객 목록을 새롭게 다시 불러옴.
    this.callApi()
      .then(res => this.setState({customers: res}))
      .catch(err => console.log(err));
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({customers: res}))
      .catch(err => console.log(err));

    this.isLoginNow();
  }

  // 세션에 정보 있으면 로그인, 정보 없으면 로그아웃 상태
  isLoginNow = () => {
    if (typeof(Storage) !== "undefined") {
      if(sessionStorage.getItem("loginInfo") == null){
        this.setState({isLogin : 0});
      }else{
        this.setState({isLogin : 1});
      }
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }
  }

  callApi = async () => {
    const response = await fetch('/api/customers');
    const body = await response.json();
    return body;
  }

  contractReloads(){
    setTimeout(function() { 
      window.location.reload();
    }, 100);
  }
  
  render() {
    var isLoginShow = {
      // 로그인을 하지 않은 상태이면 스터디 생성 버튼을 보이지 않게 해야함.
      display: this.state.isLogin == 0 ? "none" : "inline"
    };

    return (
        <div className="main_page">
            <div className="all_list_frame">
              <Link to={'/studyMake'} className="studyMake">
                  <input type="button" style = {isLoginShow} onClick = {this.contractReloads} className="btn btn-outline-danger btn-lg btn-block " id="moveBtn_study_make" value="STUDY 생성"/>
              </Link>
              <ul className="all_list_study">
                { this.state.customers ? this.state.customers.map(c => {
                  return (
                    <Link to={'/studyInfo/' + c.s_id} className="list_studyInfo">
                      <StudyItem
                        stateRefresh={this.stateRefresh}
                        key={c.s_id}
                        index={c.s_id}
                        study_name={c.study_name}
                        study_type={c.study_type}
                        num_people={c.num_people}
                        current_num_people={c.current_num_people}
                        study_period={c.study_period}
                        study_coin = {c.study_coin}
                        study_desc = {c.study_desc}
                      />
                    </Link>
                  )
                })
                  : "" }
              </ul>
            </div>
        </div>
    );
  }
}

export default MainPage;