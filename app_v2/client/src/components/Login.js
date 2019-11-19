import React, { Component } from 'react';
import './Login.css';
import { post } from 'axios';
import alert from '../utils/Alert';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            password: ''
        }
    }

    handleFormSubmit = (e) => {
        e.preventDefault(); 
    
        this.callLoginApi().then((response) => {
           
            if(response.data.length !== 0){
                console.log(response.data);
                console.log(response.data[0].PERSON_PW); 
                if(response.data[0].PERSON_PW === this.state.password){
                    this.setUserIdSession();

                    this.callLoginApi().then((result)=>{
                        let userName = result.data[0].PERSON_NAME;
                        this.setUserNameSession(userName);
                    });

                    this.props.history.push('/mainPage');
                    setTimeout(function() { 
                        window.location.reload();
                    }, 300);
                } else{
                    this.setState ({
                        userId: '',
                        password: ''
                    })
                    alert.confirm('다시 입력해주세요.', '아이디나 비밀번호를 잘못 입력했습니다.');
                }
            }else{
                this.setState ({
                    userId: '',
                    password: ''
                })
                alert.confirm('다시 입력해주세요.', '존재하지 않는 사용자입니다.');
            }
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    callLoginApi = () => {
        const url = '/api/select/person_info/where/person_id';

        return post(url,  {
            person_id: this.state.userId
        });
    }

    // userId session 저장
    setUserIdSession = () => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("loginInfo", this.state.userId);
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // userName session 저장
    setUserNameSession = (_username) => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("loginInfo_userName", _username);
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    render() {
        return (
            <div className="pageBackgroundColor loginBackgroud">
                <div style={{marginTop: 10}} className = "login_container">
                    <div className="login_label">Login</div>
                        <form onSubmit={this.handleFormSubmit} to="">
                            <div className="login_box">
                                <div className="form-group log_in_form">
                                    <label className="input_text">아이디 </label>
                                    <input type="text" className="form-control log_in_input" id="input_id" name="userId" placeholder="id" value={this.state.userId} onChange={this.handleValueChange}/>
                                </div>
                                <div className="form-group log_in_form">
                                    <label className="input_text">비밀번호  </label>
                                    <input type="password" className="form-control log_in_input" id="input_pw" name="password" placeholder="password" value={this.state.password} onChange={this.handleValueChange}/>
                                </div>
                            </div>
                            <div className="form-group log_in_form">
                                <input type="submit" value="로그인" className="btn btn-outline-primary btn-lg btn-block " id="submit"/>
                            </div>
                        </form>
                </div>
            </div>
        )
    }
}

export default Login;