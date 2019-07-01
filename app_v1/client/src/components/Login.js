import React, { Component } from 'react';
import './Login.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'

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

                    this.callNameApi().then((result)=>{
                        let userName = result.data[0].person_name;
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
                    this.WrongIdOrPasswordConfirm();
                }
            }else{
                this.setState ({
                    userId: '',
                    password: ''
                })
                this.NoExistConfirm();
            }
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    callLoginApi = () => {
        const url = '/api/login';

        return post(url,  {
            userId: this.state.userId
        });
    }

    // userId session 저장
    setUserIdSession = () => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("loginInfo", this.state.userId);
            // this.getSession();
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // myPage 이름 관련
    callNameApi = () => {
        const url = '/api/login/user_name';

        return post(url,  {
            person_id: this.state.userId
        });
    }

    // userName session 저장
    setUserNameSession = (_username) => {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("loginInfo_userName", _username);
            console.log('session에 저장된 이름: ' + sessionStorage.getItem("loginInfo_userName"));
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    // 아이디나 비밀번호 잘못 입력했을 때 확인창
    WrongIdOrPasswordConfirm = () => {
        confirmAlert({
          title: '다시 입력해주세요.',
          message: '아이디나 비밀번호를 잘못 입력하셨습니다.',
          buttons: [
            {
                label: '확인'
            }
          ]
        })
    };

    NoExistConfirm = () => {
        confirmAlert({
            title: '다시 입력해주세요.',
            message: '존재하지 않은 사용자입니다.',
            buttons: [
              {
                  label: '확인'
              }
            ]
          })
    }

    render() {
        return (
            <div className="pageBackgroundColor">
                <div style={{marginTop: 10}} className = "login_container">
                    <div className="login_label">Login</div>
                    <form onSubmit={this.handleFormSubmit} to="">
                        <div className="login_box">
                            <div className="form-group">
                                <label className="input_text">아이디 </label>
                                <input type="text" className="form-control" id="input_id" name="userId" placeholder="id" value={this.state.userId} onChange={this.handleValueChange}/>
                            </div>
                            <div className="form-group">
                                <label className="input_text">비밀번호  </label>
                                <input type="password" className="form-control" id="input_pw" name="password" placeholder="password" value={this.state.password} onChange={this.handleValueChange}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <input type="submit" value="로그인" className="btn btn-outline-danger btn-lg btn-block " id="submit"/>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;