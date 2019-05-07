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

    constructor(props) {
        super(props);
        this.state = {
            userName: ''
        }
    }

    componentWillMount() {
        this.getUserNameSession();
    }

    componentDidMount() {
        this.getUserNameSession();
    }

    // session 불러오기
    getUserNameSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({userName : sessionStorage.getItem("loginInfo_userName")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    render(){
        return(
            <div className="div_coin_management">
                {/* <div className="coin_management_header">00 님의 계좌 번호</div> */}
                <div className="coin_management_header">{this.state.userName} 님의 계좌 번호</div>
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