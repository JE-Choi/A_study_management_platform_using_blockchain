import React, { Component } from 'react';
import './MainPage.css';
import './PageDesc.css';
import StudyItem from './StudyItem';
import { Link } from 'react-router-dom';
import $ from 'jquery';

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

    this.callApi().then((res)=>{
      this.setState({customers: res});
      if(this.state.customers.length !== 0) {
        $('.out_frame_not_exist_studyItem').hide();
      }
    }).catch(err => console.log(err));

    this.isLoginNow();
  }

  // 세션에 정보 있으면 로그인, 정보 없으면 로그아웃 상태
  isLoginNow = () => {
    if (typeof(Storage) !== "undefined") {
      if(sessionStorage.getItem("loginInfo") === null){
        this.setState({isLogin : 0});
      }else{
        this.setState({isLogin : 1});
      }
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }
  }

  callApi = async () => {
    const response = await fetch('/api/studyItems');
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
      display: this.state.isLogin === 0 ? "none" : "inline"
    };

    return (
        <div className="mainPageBackgroundColor">
          <div className="all_list_frame">
            <Link to={'/studyMake'} className="studyMake">
                <input type="button" style = {isLoginShow} onClick = {this.contractReloads} className="btn btn-outline-danger btn-lg btn-block " id="moveBtn_study_make" value="STUDY 생성"/>
            </Link>
            
            <ul className="all_list_study">
              { this.state.customers ? this.state.customers.map(c => {
                return (
                  <Link to={'/studyInfo/' + c.s_id} className="list_studyInfo" onClick={this.contractReloads}>
                    <StudyItem
                      stateRefresh={this.stateRefresh}
                      key={c.s_id}
                      index={c.s_id}
                      study_name={c.study_name}
                      study_type={c.study_type}
                      num_people={c.num_people}
                      end_date={c.end_date}
                      study_coin = {c.study_coin}
                      study_desc = {c.study_desc}
                    />
                  </Link>
                )
              })
                : "" }      
            </ul>
          </div>
          <div className="out_frame_not_exist_studyItem">
            <div className="page_header">BC_STUDY</div>
            BC_STUDY를 이용해 주셔서 감사합니다.
            <br />
            <br />
            함께 공부할 스터디를 생성해주세요.
            <br />
            <span id="login_emphasis">로그인</span> 후, <span id="creation_emphasis">STUDY 생성 버튼</span>을 누르면 스터디가 생성됩니다.
            <br />
            <br />
            BC_STUDY를 통해 모두가 스터디에 전념하여 좋은 성과를 이루기를 바랍니다.
          </div>    
        </div>
    );
  }
}

export default MainPage;