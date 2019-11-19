import React, { Component } from 'react';
import Block from './../Block';
import Home from './../Home';
import Transaction from './../Transaction';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import alert from '../../utils/Alert';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txn_hash_input : '' 
    }
  }

  setReloads(){
    setTimeout(function() { 
      window.location.reload();
    }, 100);
  }


  handleFormSubmit = (e) => {
    e.preventDefault();
    let _txn_hash_input = this.state.txn_hash_input;
    this.setState({
      txn_hash_input: ''
    });
    if(_txn_hash_input.length > 1 && _txn_hash_input.substr(0,2) === '0x'){
      // _txn_hash_input
      window.location.replace('/transaction/'+_txn_hash_input);
      // this.setReloads();
    } else {
      alert.confirm('','올바른 거래 해시를 입력해주세요. (ex: 0x...)');
    }
  }

  handleValueChange = (e) => {
      let nextState = {};
      nextState[e.target.name] = e.target.value;
      this.setState(nextState);
  }

  render() {
    return (
      <Router>
        <div className="App">
          <div className="App-header">
            <div className="App_top">
              <Link to="/">
                <div className="go_to_main_link_div">
                  Block Explorer
                </div>
              </Link> 
              <form className="search_txn_form" onSubmit={this.handleFormSubmit}>
                <div className="search_txn_form_group">
                  <label className="search_txn_label">거래 해시 </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="search_txn_input" 
                    name='txn_hash_input' 
                    placeholder="0x..."
                    value={this.state.txn_hash_input} 
                    onChange={this.handleValueChange} 
                  />
                  <button 
                    type="submit" 
                    className="btn btn-outline-primary btn-lg btn-block " 
                    id="btn_search_txn">
                    검색
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="App-nav">
            <Route exact path="/" component={Home}/>
            <Route exact path="/:page" component={Home}/>
            <Route path="/block/:blockHash" component={Block}/>
            <Route path="/transaction/:txnHash" component={Transaction}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
