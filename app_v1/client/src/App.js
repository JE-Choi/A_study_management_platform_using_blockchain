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
import CommunityMenu from './components/CommunityMenu';
import EndDateReturnCoin from './components/EndDateReturnCoin';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import InitAccount from './components/InitAccount'; // 삭제 예정

class App extends Component {

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
              <Route exact path='/studyMake' component={ StudyMake }/>
              <Route exact path='/studyInfo/:id' component={ StudyInfo } />
              <Route exact path='/myPage' component = { MyPage }/>
              <Route exact path='/renameStudy/:id' component = { RenameStudy }/>
              <Route exact path='/community/:id' component = { CommunityMenu } />
              <Route exact path='/community/:id/:menu' component = { CommunityMenu } />
              <Route exact path='/community/:id/:menu/:submenu' component = { CommunityMenu } />
              <Route exact path='/manager/0101' component = { EndDateReturnCoin } />
              <Route exact path='/manager/0102' component = { InitAccount } />
              <Route exact path='/' component={ MainPage } />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
