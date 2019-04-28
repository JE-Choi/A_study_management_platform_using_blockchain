import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';

class StudyMake extends Component {

    constructor(props) {
        super(props);
        this.state = {
            study_name: '' ,
            study_type: '',
            num_people: '',
            study_period: '',
            study_desc: '',
            study_coin: '',
            person_id: '' // session 관리

            // ,
            // study_id: '',
            // person_id: '',
            // leader: '',
            // account_number: ''
        }
    }

    componentWillMount() {
        this.getSession();
    }

    handleFormSubmit = (e) => {
        // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
        e.preventDefault(); 
        this.addCustomer()
            .then((response) => {
                console.log(response.data);
                setTimeout(
                    this.addleader(response.data.insertId).then((response) =>{
                        console.log(response.data);
                        console.log('session : '+this.state.person_id);
                        this.props.history.push('/mainPage');
                    })
                    , 100);

                    
            
                
                //this.props.history.goBack();
                // 비동기적으로 고객 데이터 불러오므로, 순서적으로 보장하기 위해
                // 고객 추가한 이후에 서버 응답 받은 후 고객 목록 받기 위함.
                // 새로 고침 대신 고객 추가 component에서 부모 component의 상태 변경.
                // 부모 component에서 자식 component로 함수를 props 형태로 건내줌.
                //this.props.stateRefresh();
            })
        // 실제 배포에서는 모든 고객 데이터를 다 새로고침하면 안 되지만 잠시 이렇게 코딩 
        this.setState({
            study_name: '',
            study_type: '',
            num_people: '',
            study_period: '',
            study_desc: '',
            study_coin: ''
        })     
    }

    handleValueChange = (e) => {
        let nextState = {};
        // 만약 이름 변경하면 변경된 값을 state에 반영한다.
        console.log(e.target.name + ': ' + e.target.value);
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }
    
    addCustomer = () => {
        const url = '/api/customers';
        // FormData = 특정 데이터를 서버로 보낸다.
        // const formData = new FormData();
        // formData.append('image', this.state.file);
        // formData.append('name', this.state.userName);
        // formData.append('birthday', this.state.birthday);
        // formData.append('gender', this.state.gender);
        // formData.append('job', this.state.job);
       

        // const config = {
        //     headers: {
        //         'content-type': 'multipart/form-data'
        //     }
        // }
        // return post(url, formData, config);

        return post(url,  {
            study_name: this.state.study_name,
            study_type: this.state.study_type,
            num_people:this.state.num_people,
            study_period:this.state.study_period,
            study_desc: this.state.study_desc,
            study_coin: this.state.study_coin
       
        });
    }

    addleader = (studyId) => {
        const url = '/api/customers/leader';
        console.log(studyId);
        return post(url,  {
            study_id: studyId,
            person_id: this.state.person_id,
            leader: true,
            account_number: '11-22'
        
            // personPw: this.state.personPw,
            // personPw2: this.state.personPw2,
            // personName:this.state.personName
        });
    }

     // session 불러오기
     getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id : sessionStorage.getItem("loginInfo")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }
    
    render() {
        return (
            <div className="out_study_make_frame">
                <div className="study_make_screen">
                   <div className="study_make_header">
                        <div id="study_make_title">
                            STUDY 생성
                        </div>
                        <p id="study_make_desc">
                            - Study를 생성하는 사람이 팀장입니다.
                        </p>
                   </div>
                    <form className="study_make_form" onSubmit={this.handleFormSubmit}>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 명 </label>
                            <span id="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">종류 </label>
                            <span id="dotdot">:</span>
                            <select className="form-control" id="study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
                                <option></option>
                                <option>TOEIC</option>
                                <option>TOFEL</option>
                                <option>토익스피킹</option>
                                <option>OPIC</option>
                                <option>전산 관련 자격증</option>
                                <option>GTQ</option>
                                <option>한국사능력검정시험</option>
                                <option>기타</option>
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 기간(주) </label>
                            <span id="dotdot">:</span>
                            <select className="form-control" id="study_make_period"  name='study_period' value={this.state.study_period} onChange={this.handleValueChange}>                         
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                                {/* 24주 정도까지 할 것. */}
                            </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">Study 모집 인원(명) </label>
                            <span id="dotdot">:</span>
                                <select className="form-control" id="study_make_total_number" name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
                                    <option>0</option>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    <option>6</option>
                                    <option>7</option>
                                    <option>8</option>
                                    <option>9</option>
                                    <option>10</option>
                                </select>
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">스터디 가입 코인: </label>
                            <span id="dotdot">:</span>
                            <input type="text" className="form-control" id="study_make_coin" name='study_coin' value={this.state.study_coin} onChange={this.handleValueChange} />
                        </div>
                        <div className="study_make_form_group">
                            <label className="study_make_label">설명 </label>
                            <textarea className="form-control" id="study_make_long_desc" rows="7" cols="50" name='study_desc' value={this.state.study_desc}  onChange={this.handleValueChange}></textarea>
                        </div>
                        <button type="submit" className="btn btn-outline-danger btn-lg btn-block " id="btn_study_make">STUDY 생성</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default StudyMake;