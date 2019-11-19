import React, { Component } from 'react';

// 한 트랜잭션 정보
class QuizItem extends Component {
  state = {
    destination: '삭제된 스터디',
    startingPoint:'',
    data: this.props.data
  };

  callApi = async (study_id) => {
    const url = await fetch('/api/studyItems/view/' + study_id);
    const body = await url.json();
    return body;
  }

    render() {
      let date = this.state.data[2].split('-');
      return(
        <div>
          {this.state.data ? 
            <div className="add_schedule_detail">
                <ul className="list-group list-group-horizontal txn_content">
                  <li className="list-group-item detail_txns">{date[0]}.{date[1]}.{date[2]}</li>
                  <li className="list-group-item detail_txns">{this.state.data[9]}#{this.state.data[4]}</li>
                  <li className="list-group-item detail_txns">{this.state.data[9]}#{this.state.data[6]}</li>
                  <li className="list-group-item detail_txns study_item">퀴즈<br/>(in Study Group)</li>
                  <li className="list-group-item detail_txns">{Number(this.state.data[8]).toFixed(2)} ETH</li>
                </ul>
            </div>
          : ""}
        </div>
      )
    }
}

export default QuizItem;
