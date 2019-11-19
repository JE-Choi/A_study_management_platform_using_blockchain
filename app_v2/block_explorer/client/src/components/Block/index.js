import React, {Component} from 'react';
import Block from './Block';
import './style.css';

class index extends Component {
  render(){
    return (
      <React.Fragment>
        <Block 
          blockHash = {this.props.match.params.blockHash}
        />
      </React.Fragment>
    );
  }
}

export default index;
