import React from 'react';
// import { post } from 'axios';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import './StudyItem.css'
import { post } from 'axios';

class StudyItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current_num_people: 0
        }
    }

    componentDidMount() {
        this.callCurrentPeopleInfo()
        .then(res => {
            this.setState ({
                current_num_people: res.data.length
            });
        }).catch(err => console.log(err));
    }

    callCurrentPeopleInfo = async () => {
        const url = '/api/studyItems/current_people';

        return post(url,  {
            index: this.props.index
        });
    }

    render() {
        return (
            <li className="item_study" >
                <div className="study_background">
                </div>
                <div className="study_desc">
                    <ul className="study_desc_list"> 
                        <li><span className="study_name">{this.props.study_name} - {this.props.study_type}</span></li>
                        <li>모집 인원 : {this.props.num_people} 명</li>
                        <li>현재 인원 : {this.state.current_num_people} 명</li>
                        <li>스터디 기간 : {this.props.study_period} 주</li>
                        <li>스터디 코인 : {this.props.study_coin} 코인</li>
                        <li>스터디 설명: {this.props.study_desc}</li>
                        <CustomerDelete stateRefresh={this.props.stateRefresh} id={this.props.index}/>
                        <CustomerUpdate stateRefresh={this.props.stateRefresh} id={this.props.index}/>
                    </ul>
                </div>
            </li>
        )
    }
}

class CustomerDelete extends React.Component {

    deleteCustomer(id) {
        const url = '/api/studyItems/' + id;
        
        fetch(url, {
            method: 'DELETE'
        }).catch(err => console.log(err));
       this.props.stateRefresh();
    }

    render() {
        return (
            // 지금은 LINK 할 필요 없지만 우선 해놓음. -> 원래 삭제 버튼은 방장의 스터디 커뮤니티에서만 가능해야 함.
            <Link to={'/mainPage'} >
                <button onClick={(e) => {this.deleteCustomer(this.props.id)}}>삭제</button>
            </Link>
        )
    }
}

class CustomerUpdate extends React.Component {
    render() {
        return (
            <Link to={'/renameStudy/'+this.props.id} >
                <span>
                     <button>수정 </button>
                </span>
            </Link>
        )
    }
}

export default StudyItem;