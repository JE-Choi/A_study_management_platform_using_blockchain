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
                        <li>스터디 설명 : {this.props.study_desc}</li>
                    </ul>
                </div>
            </li>
        )
    }
}

export default StudyItem;