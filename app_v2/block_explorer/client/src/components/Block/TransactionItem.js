import React, { Component } from 'react';

class TransactionItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            txn_hash: '',
            txn_block_num: '',
            txn_time: '',
            txn_from: '',
            txn_to: '',
            txn_value: '',
            txn_gas: '',
        }
    }

    componentDidMount = () => {
        let txn = this.props.txn;
        
        this.setState({
            txn_hash: txn[0].txn_hash,
            txn_block_num: txn[1].txn_block_num,
            txn_time: txn[2].txn_time,
            txn_from: txn[3].txn_from,
            txn_to: txn[4].txn_to,
            txn_value: txn[5].txn_value,
            txn_gas: txn[6].txn_gas
        })  
    }

    render() {
        return (
            <div className="transaction_info">
                <div className="transaction_info_header_div">Transaction Info</div>
                <div className="transaction_all_info_div">
                    <table className="transaction_all_info">
                    <tbody className="total_line">
                    <tr className="txn_each_line">
                            <td className="txn_label">Txn Hash </td>
                            <td className="txn_content">
                                <div className="overflow_hash">
                                    {this.state.txn_hash}
                                </div>
                            </td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">Block No </td>
                            <td className="txn_content">{this.state.txn_block_num}</td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">Time </td>
                            <td className="txn_content">{this.state.txn_time}</td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">From </td>
                            <td className="txn_content">{this.state.txn_from}</td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">To </td>
                            <td className="txn_content">{this.state.txn_to}</td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">Value </td>
                            <td className="txn_content">{this.state.txn_value} Ether</td>
                        </tr>
                        <tr className="txn_each_line">
                            <td className="txn_label">Txn Fee </td>
                            <td className="txn_content">{this.state.txn_gas}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default TransactionItem;