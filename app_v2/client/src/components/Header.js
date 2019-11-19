import React, { Component } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import MainLogo from '../utils/Img/MainLogo/mainLogo.png';

class Header extends Component {
  render() {
    return (
        <header>
          <TopLogo/>
          <Menubar/>
        </header>
    );
  }
}

class TopLogo extends Component{
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

  PageReloads = () => {
    setTimeout(function() { 
      window.location.reload();
    }, 100);
  }

  render(){
    var loginFlag = this.state.person_id == null ? false : true;

    return(
        <div className="Top_logo">
          <div className="membership">
            <span>
              <Link to={(loginFlag)?'/mainPage':'/login'} className="top_btn" 
              onClick={(loginFlag)?this.removeSession:null}>{(loginFlag)?"Logout":"Login"}</Link>
            </span>
            <span>
            <Link to={(loginFlag)?'/accountInfo':'/'}  className="top_btn" 
              onClick={(loginFlag)?null:null}>{(loginFlag)?"Account Info":""}</Link>
            </span>
            <span>
              <Link to={(loginFlag)?'/myPage':'/signUp'}  className="top_btn" 
              onClick={(loginFlag)?this.PageReloads:this.PageReloads}>{(loginFlag)?"MyPage":"Sign Up"}</Link>
            </span>
          </div>
          <div className="logo_zone">
            <Link to={'/mainPage'} className="nav-link main_link" >
              <img src = {MainLogo} className = "main_logo" alt="메인 로고" />
           </Link>
          </div>
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
              <Link to={'/pageDesc'} className="nav-link">About Study_Chain</Link>
          </li>
          {/* <hr className="menu_line"/> */}
          <li className = "menu_line">  
            <div></div>
          </li>
          <li>
              <Link to={'/mainPage'} className="nav-link">Study List</Link>
          </li>
        </ul>
     </nav>
    );
  }
}

export default Header;