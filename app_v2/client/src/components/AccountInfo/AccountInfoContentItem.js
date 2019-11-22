import React, { Component } from 'react';
import './styles.css';

class AccountInfoContentItem extends Component {
  state = {
    destination: '삭제된 스터디',
    startingPoint:''
  };
  
  componentWillMount = () =>{
    let destination = (this.props.destination).split('#');
    if(destination.length === 2){
      if(destination[0] === 'Main'){
        let person_name = this.props.person_name;
        this.setState({
          destination: person_name
        });
      } else {
        let study_id = destination[0];
        this.callApi(study_id).then((res)=>{
          if(res.length !== 0){
            this.setState({
              destination: `'${res[0].study_name}' 내의 계좌`
            });
          }
        });
      }
    } else{
      this.setState({
        destination: this.props.destination
      });
    }
    let startingPoint= this.props.startingPoint.split('#');
    if(startingPoint.length > 1){
      if(startingPoint[0] !== 'Main'){
        let person_name = this.props.person_name;
        this.callApi(startingPoint[0]).then((res)=>{
          this.setState({
            startingPoint: `'${res[0].study_name}' 내의 계좌`,
            destination: person_name
          });
        });
      } else{
        let person_name = this.props.person_name;
        this.setState({
          startingPoint: person_name
        });
      }
    } else {
      this.setState({
        startingPoint: '관리자'
      });
    }
  }

  callApi = async (study_id) => {
    const url = await fetch('/api/studyItems/view/' + study_id);
    const body = await url.json();
    return body;
  }

  render() {
    return (
      <div className="account_info_out_div">
      <div className="account_info_left_div">
        <div className="account_info_detail_date">
          <span className="account_info_detail">{this.props.date}</span>
        </div>
        <div className="account_info_detail_to">
          <span className="account_info_lbl_detail">to. </span>
          <span className="account_info_detail">{this.state.destination}</span>
        </div>
        <div className="account_info_detail_from">
          <span className="account_info_lbl_detail">from. </span>
          <span className="account_info_detail">{this.state.startingPoint}</span>
        </div>
      </div>
      <div className="account_info_right_div">
        <div className="account_info_detail_value">
          <span>{this.props.content === 'm_Account_charge' ? '+': 
          this.props.content === 'study_join' ? "-" : "+"}</span>
          <span className="account_info_detail">{Number(this.props.etherNum).toFixed(2)} ETH</span>
        </div>
        <div className="account_info_detail_content">
        <span className="account_info_detail">
        {this.props.content === 'm_Account_charge' ? '본 계좌 충전': 
        this.props.content === 'study_join' ? "스터디 계좌 충전" : "스터디 종료"}
        </span>
        </div>
      </div>
      <div className="clear"></div>
      <div className="txn_hash_div">
        <div className="txn_hash_div_l">거래해시: </div>
        <div className="txn_hash_div_r">{this.props.txn_hash}</div>
      </div>
    </div>
    );
  }
}

export default AccountInfoContentItem;
