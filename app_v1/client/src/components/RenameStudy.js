import React, { Component } from 'react';
import './AboutStudy.css';
import { post } from 'axios';

class RenameStudy extends Component {
    render() {
        return (
            <div className="out_study_make_frame">
                <div className="study_make_screen">
                   <div className="study_make_header">
                        <div id="study_make_title">
                            STUDY 수정
                        </div>
                   </div>
                    <FormComponent id={this.props.match.params.id}/>
                </div>
            </div>
        );
    }
}

class FormComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            study_item_info: '',
            completed: 0,
            study_name: '' ,
            study_type: '',
            num_people: '',
            study_period: '',
            study_coin: '',
            study_desc: ''
        }
    }

    handleFormSubmit = (e) => {
        // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
        e.preventDefault(); 
    
        this.callRenameApi().then((response) => {
            console.log(response.data);
            window.history.back();
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        // 만약 이름 변경하면 변경된 값을 state에 반영한다.
        console.log(e.target.name + ': ' + e.target.value);
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    componentDidMount() {
        this.callApi()
          .then(res => {
            //   this.setState({study_item_info: res});
            this.setState({
                completed: 0, 
                study_name: res[0].study_name,
                study_type: res[0].study_type,
                num_people: res[0].num_people,
                study_period: res[0].study_period,
                study_coin: res[0].study_coin,
                study_desc: res[0].study_desc
            })
        }).catch(err => console.log(err));
    }
    
    callApi = async () => {
        const response = await fetch('/api/customers/view/' + this.props.id);
        const body = await response.json();
        return body;
    }

    callRenameApi = () => {
        const url = '/api/customers/view/rename/';

        return post(url,  {
            rename_index: this.props.id,
            study_name:  this.state.study_name,
            study_type: this.state.study_type,
            num_people: this.state.num_people,
            study_period: this.state.study_period,
            study_coin: this.state.study_coin,
            study_desc: this.state.study_desc
        });
    }
      
    render() {
        return(
            <form className="study_make_form" onSubmit = {this.handleFormSubmit}>
                <div className="study_make_form_group">
                    <label className="study_make_label">스터디 명: </label>
                    <span class="dotdot">:</span>
                    <input type="text" className="form-control" id="re_study_make_name" name='study_name' value={this.state.study_name} onChange={this.handleValueChange} />
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">종류 </label>
                    <span class="dotdot">:</span>
                    <select className="form-control" id="re_study_make_subject" name='study_type' value={this.state.study_type} onChange={this.handleValueChange}>
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
                    <span class="dotdot">:</span>
                    <select className="form-control" id="re_study_make_period"  name='study_period' value={this.state.study_period}  onChange={this.handleValueChange}>
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
                    <span class="dotdot">:</span>
                    <select className="form-control" id="re_study_make_total_number"  name='num_people' value={this.state.num_people}  onChange={this.handleValueChange}>
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
                    <input type="text" className="form-control" id="re_study_make_coin" name='study_coin' value={this.state.study_coin} onChange={this.handleValueChange} />
                </div>
                <div className="study_make_form_group">
                    <label className="study_make_label">설명 </label>
                    <textarea className="form-control" id="re_study_make_long_desc" rows="7" cols="50" name='study_desc' value={this.state.study_desc}  onChange={this.handleValueChange}></textarea>
                </div>
                <button type="submit" className="btn btn-outline-danger btn-lg btn-block " id="re_btn_study_make">STUDY 수정</button>
            </form>
        );
    }
}

export default RenameStudy;