import React, { Component } from 'react';
import Web3 from 'web3';
import TransactionItem from './TransactionItem';
import DBControl_txn from '../../utils/DBControl_txn';
import dotenv from "dotenv";
dotenv.config();
var web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_SERVER_IP));

class TransactionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transaction_array: [], // 한 block에 해당하는 transaction 배열
            cnt:0
        }
    }

    componentWillMount = async ()=> {
        this.getTransactionInfo();
    }

    loadTransactionHash = (_txnHash) =>{
        return new Promise(function (resolve, reject) {
            DBControl_txn.callSelectTxnInfo(_txnHash.substr(2)).then((res)=>{
                console.log(res.data);
                if(res.data.length > 0){
                    resolve(res.data[0].t_hash);
                } else {
                    resolve("");
                }
            });
        });
    }

    getTransactionInfo = async() => {
        let block_num = this.props.blockNum;
        console.log(block_num);
        let transaction_array = [];
        web3.eth.getBlockTransactionCount(block_num, true).then((cnt)=>{
            this.setState({cnt : cnt});
            console.log('cnt', cnt);
            if(cnt > 0){
                for(var j=0; j < cnt; j++){
                    web3.eth.getTransactionFromBlock(block_num, j).then((_transaction_li)=>{
                        let transaction_li = _transaction_li;
                        let txn_hash = transaction_li.hash;
                        let txn_block_num = transaction_li.blockNumber;
                        let txn_from = transaction_li.from;
                        let txn_to = transaction_li.to;
                        let txn_value = web3.utils.fromWei(String(transaction_li.value), 'ether');
                        let txn_gas = web3.utils.fromWei(String(transaction_li.gas), 'ether');

                        this.loadTransactionHash(txn_hash).then((res)=>{
                            let transaction_sub_array = [];
                            transaction_sub_array.push({'txn_hash': txn_hash});
                            transaction_sub_array.push({'txn_block_num': txn_block_num});
                            transaction_sub_array.push({'txn_time': this.props.timestamp});
                            transaction_sub_array.push({'txn_from': txn_from});
                            if(res !== ""){
                                transaction_sub_array.push({'txn_to': res});
                            } else {
                                transaction_sub_array.push({'txn_to': txn_to});
                            }
                            transaction_sub_array.push({'txn_value': txn_value});
                            transaction_sub_array.push({'txn_gas': txn_gas});
                            transaction_array.push(transaction_sub_array);
                            
                            this.setState({
                                transaction_array:transaction_array
                            });
                        })
                    });
                }
            }
        });
    }

    render() {
       return (
            <React.Fragment>
                {this.state.transaction_array.length === this.state.cnt ? this.state.transaction_array.map(c => {
                    return (
                        <TransactionItem txn = {c}/>
                    )
                })
                : ""}
            </React.Fragment>
        );
    }
}

export default TransactionList;