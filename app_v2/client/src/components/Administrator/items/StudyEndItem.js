import React, { Component } from 'react';

// 한 트랜잭션 정보
class StudyEndItem extends Component {
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
      return(
        <div>
          {this.state.data ? 
            <div className="add_schedule_detail">
                <ul className="list-group list-group-horizontal txn_content">
                  <li className="list-group-item detail_txns">{this.state.data[2]}</li>
                  <li className="list-group-item detail_txns">{this.state.data[7]}#{this.state.data[4]}</li>
                  <li className="list-group-item detail_txns">Main#{this.state.data[4]}</li>
                  <li className="list-group-item detail_txns study_item">스터디 종료<br/>(in Study Group)</li>
                  <li className="list-group-item detail_txns">{Number(this.state.data[6]).toFixed(2)} ETH</li>
                </ul>
            </div>
          : ""}
        </div>
      )
    }
}

export default StudyEndItem;
