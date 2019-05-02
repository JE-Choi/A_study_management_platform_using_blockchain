import React, { Component } from 'react';
import './UserPage.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

class UserPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            study_name: '' ,
            study_type: '',
            study_period: ''
        }
    }

    componentWillMount() {
        this.getUserNameSession();
    }

    componentDidMount() {
        this.getUserNameSession();

        // this.callDBStudyInfo().then()
    }

    callDBStudyInfo = async () => {
        // post로 하기. url, 개인 ID 전달하기

        // 참고해서.
        // callJoinApi = () => {
        //     const url = '/api/customers/join/' + this.props.match.params.id;
        //     post(url,  {
        //         study_id: this.props.match.params.id,
        //         person_id: this.state.person_id,
        //         leader: false,
        //         account_number: '11-22'
        //     }).then(()=>{
        //         this.props.history.push('/mainPage');
        //     })

        // const response = await fetch('/api/myPage/info/');
        // const body = await response.json();
        // return body;
    }

    // componentDidMount() {
    //     this.callApi()
    //       .then(res => {
    //           //this.setState({study_item_info: res});
    //           this.setState ({
    //             study_name: res[0].study_name ,
    //             study_type: res[0].study_type,
    //             num_people: res[0].num_people,
    //             current_num_people: res[0].current_num_people,
    //             study_period: res[0].study_period,
    //             study_coin: res[0].study_coin,
    //             study_desc: res[0].study_desc
    //         })
    //     }).catch(err => console.log(err));
    //     this.callLeaderApi().then(res => {
    //         this.setState ({
    //             leader_name: res[0].person_name
    //         })
    //     })
    //     this.getSession();
    // }

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
            <div className="main_UserP">
                <div style={{marginTop: 10}} className = "userP_container">
                    <div className="userP_label">
                        <div className="userP_page_label">{this.state.userName} 님의 Page</div>
                        <div className="userP_current_study_label">
                            -현재 가입 중인 Study List
                        </div>
                    </div>
                    <div className="userP_box">
                        <Link to={'/communityMenu'}  className="communityMenu">
                            <div className="current_study_item1">
                                <span>Toeic 파이팅</span>
                                <br/>
                                <span>(4월1일 ~ 6월30일)</span>
                            </div>
                        </Link>
                        <div className="current_study_item2">
                            <span>Toeic 파이팅</span>
                            <br/>
                            <span>(4월1일 ~ 6월30일)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default UserPage;