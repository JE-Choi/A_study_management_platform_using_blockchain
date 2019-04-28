import React, { Component } from 'react';
import './CoinManagement.css';

class CoinManagement extends Component {
    render() {
        return (
            <div className="main_coinManagement">
                <div className="content_coinManagement">
                    <AboutCoin />
                </div>
            </div>
        )
    }
}

class AboutCoin extends Component{
    render(){
        return(
            <div className="div_coin_management">
                <div className="coin_management_header">00 님의 계좌 번호</div>
                <div className="div_account_number">
                    <input type="text" className="form-control account_number" />
                </div>
                <div className="coin_management_content">
                    <span className="coin_status_text">잔여 코인</span>
                    <span className="btn btn-danger" id="sum_of_coin">20 코인</span> 
                </div>
                <div className="content_coin_usage">
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 03 / 02</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-3</span>
                    </div>
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 03 / 05</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-3</span>
                    </div>
                    <div className="div_coin_usage">
                        <span className="date_of_use">19 / 03 / 05</span>
                        <span className="desc_of_use">지각</span>
                        <span className="used_coin">-3</span>
                    </div>
                </div>
            </div>
        );
    }
}


export default CoinManagement;