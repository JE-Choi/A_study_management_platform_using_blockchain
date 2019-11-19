import React, { Component } from "react";
import MainPage from './components/MainPage';
import PageDesc from './components/PageDesc';
import Footer from './components/Footer';
import StudyMake from './components/StudyMake';
import Header from './components/Header';
import SignUp from './components/SignUp';
import StudyInfo from './components/StudyInfo';
import Login from './components/Login';
import MyPage from './components/MyPage';
import RenameStudy from './components/RenameStudy';
import CommunityMenu from './components/CommunityMenu/index';
import RecruitmentCommunityMenu from './components/CommunityMenu/RecruitmentCommunityMenu';
import Administrator from './components/Administrator/Administrator';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AccountInfo from './components/AccountInfo';
import InitContract from './components/BlockChain/InitContract';
class App extends Component {
  componentDidMount = async() =>{
    InitContract.init();
    
  }
  
  render() {
    return (
      <div className="App">
        <Router>
          <Header />
          <Switch>
              <Route exact path='/signUp' component={ SignUp } />
              <Route exact path='/pageDesc' component={ PageDesc } />
              <Route exact path='/mainPage' component={ MainPage } />
              <Route exact path='/login' component={ Login } />
              <Route exact path='/accountInfo' component={ AccountInfo } />
              <Route exact path='/accountInfo/:submenu' component={ AccountInfo } />
              <Route exact path='/studyMake' component={ StudyMake }/>
              <Route exact path='/studyInfo/:id' component={ StudyInfo } />
              <Route exact path='/myPage' component = { MyPage }/>
              <Route exact path='/renameStudy/:id' component = { RenameStudy }/>
              <Route exact path='/community/:id' component = { CommunityMenu } />
              <Route exact path='/community/:id/:menu' component = { CommunityMenu } />
              <Route exact path='/community/:id/:menu/:submenu' component = { CommunityMenu } />
              <Route exact path='/recruitment_community/:id' component = { RecruitmentCommunityMenu }/>
              <Route exact path='/administrator' component = { Administrator }/>
              <Route exact path='/' component={ MainPage } />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
