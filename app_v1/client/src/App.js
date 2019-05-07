import React, { Component } from "react";
import BlockChain from "./components/BlockChain";

import MainPage from './components/MainPage';
import PageDesc from './components/PageDesc';
import Footer from './components/Footer';
import StudyMake from './components/StudyMake';
import Header from './components/Header';
import SignUp from './components/SignUp';
import StudyInfo from './components/StudyInfo';
import Login from './components/Login';
import MyPage from './components/UserPage';
import RenameStudy from './components/RenameStudy';
import CommunityMenu from './components/CommunityMenu';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class App extends Component {

  render() {
    return (
      <div className="App">
        {/* <BlockChain/> */}
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
              <Route exact path='/' component={ MainPage } />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
