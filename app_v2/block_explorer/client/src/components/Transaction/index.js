import React, {Component} from 'react';
import TransactionInfo from './TransactionInfo';

class index extends Component {
  render(){
    console.log(this.props);
    return (
      <React.Fragment>
        <TransactionInfo 
          txnHash = {this.props.match.params.txnHash}
        />
      </React.Fragment>
    );
  }
}

export default index;
