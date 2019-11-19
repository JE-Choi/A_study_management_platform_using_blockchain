import React, { Component } from 'react';
import AccountInfo from './AccountInfo';
import AccountInfoContent from './AccountInfoContent';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class index extends Component {
  render() {
    return (
      <div className = "AccountInfo_MainContainer">
        <Router>
          <Switch>
              <Route exact path='/accountInfo' component={ AccountInfo } />
              <Route exact path='/accountInfo/content' component={ AccountInfoContent } />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default index;
