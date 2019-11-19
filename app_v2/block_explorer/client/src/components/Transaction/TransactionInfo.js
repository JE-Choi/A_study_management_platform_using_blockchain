import React, { Component } from 'react';
import Web3 from 'web3';
import TransactionItem from './TransactionItem';
import DBControl_txn from '../../utils/DBControl_txn';
import alert from '../../utils/Alert';
import dotenv from "dotenv";
dotenv.config();
var web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_SERVER_IP));

class TransactionInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionInfo: [], 
            // cnt:0
        }
    }

    componentWillMount = async ()=> {
        this.getTransactionInfo();
    }

    loadTransactionHash = (_txnHash) =>{
        console.log(_txnHash.substr(2));
        return new Promise(function (resolve, reject) {
            DBControl_txn.callSelectTxnInfo(_txnHash.substr(2)).then((res)=>{
                if(res.data.length > 0){
                    resolve(res.data[0].t_hash);
                } else {
                    resolve("");
                }
            });
        });
    }

    getTransactionInfo = async() => {
        let transactionInfo_array = [];
        this.loadTransactionHash(this.props.txnHash).then((res)=>{
            if(res !== ""){
                web3.eth.getTransactionReceipt(this.props.txnHash).then((_transaction)=>{
                
                    if(_transaction !== null){
                        let blockNumber = _transaction.blockNumber;
                        let transactionIndex = _transaction.transactionIndex;
                        web3.eth.getTransactionFromBlock(blockNumber, transactionIndex).then((_transactionInfo)=>{
                        let transactionInfo = _transactionInfo;
                        let txn_hash = transactionInfo.hash;
                        let txn_block_num = transactionInfo.blockNumber;
                        let txn_from = transactionInfo.from;
                        let txn_to = transactionInfo.to;
                        let txn_value = web3.utils.fromWei(String(transactionInfo.value), 'ether');
                        let txn_gas = web3.utils.fromWei(String(transactionInfo.gas), 'ether');
                        web3.eth.getBlock(transactionInfo.blockHash).then((currBlockObj)=>{
                            console.log(JSON.stringify(currBlockObj));
                            console.log('BlockInfo',currBlockObj);
                        
                            // Set the Component state
                            let date = new Date(currBlockObj.timestamp*1000);
                            let date_str = date.getFullYear()+'-'+(date.getMonth()+1)+ '-'+date.getDate();
                            let time_str = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(); 
                            let made_block_date = date_str + ' ' + time_str;
                            console.log(made_block_date);
                            let transaction_sub_array = [];
                            transaction_sub_array.push({'txn_hash': txn_hash});
                            transaction_sub_array.push({'txn_block_num': txn_block_num});
                            transaction_sub_array.push({'txn_time': made_block_date});
                            transaction_sub_array.push({'txn_from': txn_from});
                            if(res !== ""){
                                transaction_sub_array.push({'txn_to': res});
                            } else {
                                transaction_sub_array.push({'txn_to': txn_to});
                            }
                            transaction_sub_array.push({'txn_value': txn_value});
                            transaction_sub_array.push({'txn_gas': txn_gas});
                            transactionInfo_array.push(transaction_sub_array);

                            this.setState({
                                transactionInfo:transactionInfo_array
                            });
                        });     
                    });
                }
            });
            } else {
                alert.replaceConfirm('','검색 결과가 존재하지 않습니다.','/');
            }
        });
    }

    render() {
       return (
            <div>
                {this.state.transactionInfo.length ? this.state.transactionInfo.map(c => {
                return (
                    <TransactionItem txn = {c}/>
                )
            })
            : ""}
            </div>
        );
    }
}

export default TransactionInfo;