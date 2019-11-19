import React, { Component } from 'react';
import Web3 from 'web3';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import dotenv from "dotenv";
dotenv.config();
var web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_SERVER_IP));

class Home_web extends Component {
    constructor(props) {
        super(props);
        this.state = {
            block_ids: [],
            block_hashes: [],
            block_ts: [],
            tx_ns: [],
            block_tx_ns: [],
            curr_block: 0,
            max_blocks: 0 ,// 한 페이지 당 최대 블럭 수
            select_page_num: 1,
            is_reload: false,
            output_blocks_arr: [] // 출력할 블록들을 담은 배열   
        }
    }

    componentDidMount = async ()=> {
        var curr_block_no = await web3.eth.getBlockNumber();

        this.setState({
          curr_block: curr_block_no
        });

        this.getBlocks(curr_block_no,this.state.select_page_num);
    }

    getBlocks = async(curr_block_no, _select_page_num)=>{
        var max_blocks = 15; // 한 페이지에 보이는 최대 블록 수
        let start_page_block = 0; // 한 페이지의 첫 블록
        let end_page_block = 15; // 한 페이지의 마지막 블록
        let select_page_num = _select_page_num;

        if (curr_block_no < max_blocks) {
            max_blocks = curr_block_no;
        }

        // 1 page가 아닌 경우
        if(select_page_num > 1){
            start_page_block = end_page_block * (select_page_num-1);
            end_page_block = end_page_block * select_page_num;
            curr_block_no = curr_block_no - start_page_block;
        }
        
        let output_blocks_arr = [];
        
        // max_blocks 수 만큼 최신 블록 수 출력
        for (var i = start_page_block; i < end_page_block; i++, curr_block_no--) {
            var currBlockObj = await web3.eth.getBlock(curr_block_no);

            let date = new Date(currBlockObj.timestamp*1000);
            let date_str = date.getFullYear()+'-'+(date.getMonth()+1)+ '-'+date.getDate();
            let time_str = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(); 
            let made_txns_date = date_str + ' ' + time_str;
            let tx_ns = parseInt(currBlockObj.transactions.slice().length, 10);

            let output_blocks_sub_arr = [];
            output_blocks_sub_arr.push({'block_ids': currBlockObj.number});
            output_blocks_sub_arr.push({'block_hashes': currBlockObj.hash});
            output_blocks_sub_arr.push({'block_tx_ns': tx_ns});
            output_blocks_sub_arr.push({'block_ts': made_txns_date});
            output_blocks_arr.push(output_blocks_sub_arr);
        }

        this.setState({
            output_blocks_arr : output_blocks_arr
        });
    }

    callbackReload = (_select_page_num) =>{
        this.setState({
            block_ids: [],
            block_hashes: [],
            block_ts: [],
            block_tx_ns: [],
            is_reload: true
        });
        this.getBlocks(this.state.curr_block, Number(_select_page_num));
    }

    render() {
        return (
            <div className="home_web">
                <div className="sum_of_block_div_web">
                    Current Block : {this.state.curr_block}
                </div>
                <table className="block_lists_web">
                    <thead className="block_lists_head_web">
                        <tr>
                            <th className="block_explorer_label1_web">Block No</th>
                            <th className="block_explorer_label2_web">Block Hash</th>
                            <th className="block_explorer_label3_web">Tx#</th>
                            <th className="block_explorer_label4_web">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="block_lists_content_web">
                        {this.state.output_blocks_arr ? this.state.output_blocks_arr.map(c => {
                            return (
                                <tr key={c[1].block_hashes}>
                                    <td className="content_block_no_web">
                                        {c[0].block_ids}
                                    </td>
                                    <td className="content_hash_web">
                                        <Link to={`/block/${c[1].block_hashes}`}>
                                            {c[1].block_hashes}
                                        </Link>
                                    </td>
                                    <td className="content_txns_web">
                                        {c[2].block_tx_ns}
                                    </td>
                                    <td className="content_timestamp_web">
                                        {c[3].block_ts}
                                    </td>
                                </tr>
                            )
                        })
                        : ""}
                    </tbody>
                </table>
                {this.state.curr_block !== 0 ?
                    <div className="pagination_div_web">
                        <Pagination callbackReload = {this.callbackReload} curr_block = {this.state.curr_block}/>
                    </div> 
                : ""}
            </div>
        );
    }
}

export default Home_web;