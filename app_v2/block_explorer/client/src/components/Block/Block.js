import React, { Component } from 'react';
import TransactionList from './TransactionList';
import Web3 from 'web3';
import dotenv from "dotenv";
dotenv.config();
var web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_SERVER_IP));

class Block extends Component {
  constructor(props) {
    super(props);
    this.state = {
      block: [],
      block_id: 0,
      block_hash: '',
      block_ts: 0,
      block_txs: ''
    }
  }

  componentWillMount = async ()=> {
    // Get the block hash from URL arguments (defined by Route pattern)
    var block_hash = this.props.blockHash;
    this.getBlockState(block_hash);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props.match);
    if(this.props.match !== undefined){
      var block_hash_old = this.props.match.params.blockHash;
      var block_hash_new = nextProps.match.params.blockHash;
      // compare old and new URL parameter (block hash)
      // if different, reload state using web3
      if (block_hash_old !== block_hash_new)
      this.getBlockState(block_hash_new);
    }
  }

  getBlockState = async(block_hash)=>{
    console.log("Block hash: " + block_hash);
    // Use web3 to get the Block object
    var currBlockObj = await web3.eth.getBlock(block_hash);
    console.log(JSON.stringify(currBlockObj));
    console.log('BlockInfo',currBlockObj);

    // Set the Component state
    let date = new Date(currBlockObj.timestamp*1000);
    let date_str = date.getFullYear()+'-'+(date.getMonth()+1)+ '-'+date.getDate();
    let time_str = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(); 
    let made_block_date = date_str + ' ' + time_str;

    this.setState({
      block_id: currBlockObj.number,
      block_hash: currBlockObj.hash,
      block_ts: made_block_date,
      block_txs: parseInt(currBlockObj.transactions.slice().length, 10),
      block: currBlockObj
    })
  }

  render() {
      const block = this.state.block;
      const difficulty = parseInt(block.difficulty, 10);
      const difficultyTotal = parseInt(block.totalDifficulty, 10);

      return (
        <div className="Block">
          <div className="block_info_header_div">Block Info</div>
          <div className="block_all_info_div">
            <table className="block_all_info">
              <tbody className="total_line">
                <tr className="block_each_line">
                  <td className="block_label">Block No </td>
                  <td className="block_content">{this.state.block.number}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Time </td>
                  <td className="block_content">{this.state.block_ts}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Transactions </td>
                  <td className="block_content">{this.state.block_txs}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Hash </td>
                  <td className="block_content">
                    <div className="overflow_hash">
                      {this.state.block.hash}
                    </div>
                  </td>
                </tr>
                <tr className="block_each_line"> 
                  <td className="block_label">Parent hash </td>
                    <td className="block_content" >
                      <div className="overflow_hash">
                        {this.state.block.parentHash}
                      </div>
                  </td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Nonce </td>
                  <td className="block_content">{this.state.block.nonce}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Size </td>
                  <td className="block_content">{this.state.block.size} bytes</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Difficulty </td>
                  <td className="block_content">{difficulty}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Difficulty </td>
                  <td className="block_content">{difficultyTotal}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Gas Limit </td>
                  <td className="block_content">{block.gasLimit}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Gas Used </td>
                  <td className="block_content">{block.gasUsed}</td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Sha3Uncles </td>
                  <td className="block_content">
                    <div className="overflow_hash">
                      {block.sha3Uncles}
                    </div>
                  </td>
                </tr>
                <tr className="block_each_line">
                  <td className="block_label">Extra data </td>
                  <td className="block_content">
                    <div className="overflow_hash">
                      {this.state.block.extraData}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {this.state.block_ts !== 0 ?
            <div className="transactionItem_div">
              <TransactionList 
                timestamp = {this.state.block_ts} 
                blockNum = {this.state.block.number}
              />
           </div>              
          : "" }
        </div>
      );
  }
}
export default Block;