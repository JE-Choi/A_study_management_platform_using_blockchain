import React, { Component } from 'react';
import './SignUp.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'

class SignUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            personId: '',
            personPw: '',
            personPw2: '',
            personName: ''
        }
    }

    handleFormSubmit = (e) => {
        e.preventDefault(); 

         //  Pw와 Pw2가 같은지 판별한 후 같은 경우만 DB에 삽입
         if(this.state.personPw === this.state.personPw2){
            this.callSignUpOverlapApi();
        } else{
            this.setState ({
                personPw: '',
                personPw2: ''
            })
            this.MismatchPwConfirm();
        }
    }

    handleValueChange = (e) => {
        let nextState = {};
        // 만약 이름 변경하면 변경된 값을 state에 반영한다.
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    // 회원가입할 때 PERSON_INFO에 data 삽입.
    callSignUpApi = () => {
        const url = '/api/signup';

        return post(url,  {
            personId: this.state.personId,
            personPw: this.state.personPw,
            personName:this.state.personName
        });
    }

    // 회원 가입할 때 중복 ID 체크하는 부분
    callSignUpOverlapApi = () => {
        const url = '/api/select/person_info/where/person_id';

        post(url,  {
            person_id: this.state.personId
        })
        .then(res => {
        var check_id = res.data.length;
        
         // 중복 ID가 없는 경우 회원가입 가능
         if(check_id === 0) {
            this.callSignUpApi()
            .then((response) => {
                this.SignUpConfirm();

                setTimeout(()=>{
                    this.props.history.push('/mainPage');
                },3000);
            })
            this.setState ({
                personId: '',
                personPw: '',
                personPw2: '',
                personName: ''
            })
        }
        // 중복 ID가 있는 경우 회원가입 불가능
        else{
            this.setState ({
                personId: '',
                personPw: '',
                personPw2: '',
                personName: ''
            })
            this.OverlapIdConfirm();
        }
      }).catch(err => console.log(err));
    }

    // 비밀번호 일치하지 않는다는 안내
    MismatchPwConfirm = () => {
        confirmAlert({
            title: '비밀번호가 일치하지 않습니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 회원가입 축하 안내
    SignUpConfirm = () => {
        confirmAlert({
            title: '회원가입을 축하합니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 중복된 아이디는 회원가입 할 수 없다는 안내
    OverlapIdConfirm = () => {
        confirmAlert({
            title: '중복된 아이디입니다.',
            message: '회원가입을 진행할 수 없습니다.',
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
                <div style={{marginTop: 10}} className = "container">
                    <div className="sign_up_label">Sign Up</div>
                    
                    <form onSubmit={this.handleFormSubmit}>
                        <div className="sign_box">
                            <div className="form-group">
                                <label className="input_text">아이디 </label>
                                <input type="text" className="form-control" name="personId" placeholder="id" value={this.state.personId} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group">
                                <label className="input_text">비밀번호  </label>
                                <input type="password" className="form-control" name="personPw" placeholder="password" value={this.state.personPw} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group">
                                <label className="input_text">비밀번호<br/>확인</label>
                                <input type="password" className="form-control" name="personPw2" placeholder="password" value={this.state.personPw2} onChange={this.handleValueChange} />
                            </div>
                            <div className="form-group">
                                <label className="input_text">이름 </label>
                                <input type="text" className="form-control" name="personName" placeholder="name" value={this.state.personName} onChange={this.handleValueChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <input type="submit" value="회원가입" className="btn btn-outline-danger btn-lg btn-block " id="submit"/>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default SignUp;