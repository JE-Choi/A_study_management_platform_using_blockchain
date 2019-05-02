import React, { Component } from 'react';
import './Header.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class Header extends Component {

  render() {
    return (
        <header>
          <Top_logo/>
          <Menubar/>
        </header>
    );
  }
}

class Top_logo extends Component{
   // 생성자
   constructor(props) {
    super(props);
    this.state = {
      loginShown: true, // 로그인 전
      person_id: sessionStorage.getItem("loginInfo")
    }
  }

  // log out
  removeSession = () => {
    if (typeof(Storage) !== "undefined") {
      // session 삭제
      sessionStorage.clear();

      setTimeout(function() { 
          window.location.reload();
      }, 100);
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }
  }    

  render(){
    var loginIsShow = {
      display: this.state.person_id == null ? "inline" : "none"
    };
    var logoutIsShow = {
      display: this.state.person_id != null ? "inline" : "none"
    };

    return(
        <div className="Top_logo">
          <div className="Membership">
            <span>
              <Link to={'/login'} style={ loginIsShow } className="top_btn">Login</Link>
            </span> 
            <span>
              {/* 로그아웃 부분 링크 TO부분 바꿔야함. */}
              <Link to={'/mainPage'} style={ logoutIsShow } className="top_btn" onClick={this.removeSession}>Logout</Link>
            </span> 
            <span>
              <Link to={'/signUp'} style={ loginIsShow } className="top_btn">Sign Up</Link>
            </span>
            <span>
              <Link to={'/myPage'} style={ logoutIsShow } className="top_btn">MyPage</Link>
            </span>
          </div>

          <span>
            <Link to={'/mainPage'} className="nav-link" >
              <img className="main_logo" src= "http://34.85.53.30/%EB%A1%9C%EA%B3%A0.png" width="170rem" height="170rem" alt="Main Logo" />
            </Link>
          </span>
      </div>
    );
  }
}

class Menubar extends Component{
  render(){
    return(
      <nav className="menubar_wrapper">
        <ul className="nav">
          <li>
              <Link to={'/pageDesc'} className="nav-link">About 스터디체인</Link>
          </li>
          <hr className="menu_line"/>
          <li>
              <Link to={'/mainPage'} className="nav-link">Study List</Link>
          </li>
        </ul>
     </nav>
    );
  }
}

export default Header;