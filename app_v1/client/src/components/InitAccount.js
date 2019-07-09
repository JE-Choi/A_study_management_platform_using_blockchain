import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import { post } from 'axios';

class InitAccount extends Component {
  state = { storageValue: 0, web3: null, accounts: null};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // await web3.eth.personal.newAccount();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts});
      console.log(accounts);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  addAccount = async (account_id, account_num)  => {
    const url = '/api/init_account_list';

    return post(url,  {
        account_id: account_id,
        account_num: account_num,
        is_use: false,
    });
}

input = async () => {
    const { accounts, web3 } = this.state;
    for(let i = 0 ; i < accounts.length ; i++){
        if(i>1){ // 1까지 관리자 계좌임.
            this.addAccount(i,accounts[i]).then((res)=>{
                console.log(res);
            });
        }
      }
}

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <button onClick={this.input}>계좌 DB에 삽입</button>
      </div>
    );
  }
}

export default InitAccount;
