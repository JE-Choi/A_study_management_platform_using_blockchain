import React, { Component } from 'react';
import Pagination from './Pagination';
import './style.css';

class index extends Component {
    render(){
      return (
            <React.Fragment>
                <Pagination 
                    callbackReload = {this.props.callbackReload} 
                    curr_block = {this.props.curr_block}
                />
            </React.Fragment>
        );
    }
}
  
export default index;
  