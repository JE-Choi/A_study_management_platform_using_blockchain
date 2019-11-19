import React, { Component } from 'react';
import $ from 'jquery';

class CommunityMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_menu: 'Schedule'
        }
    }

    componentDidMount(){
        this.setEnterStudyidSession();
        this.make_menu();
        console.log(this.props.history);
        console.log(sessionStorage.getItem("selected_menu"));
        let select_menu = sessionStorage.getItem("selected_menu");
        this.setState({selected_menu:select_menu});
    }

    // Studyitem session 저장
    setEnterStudyidSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.callStudyItem().then((res)=>{
                sessionStorage.setItem("enterStudyid", this.props.id);
                sessionStorage.setItem("enterStudyitem", JSON.stringify(res)); // 객체를 session에 저장하기 위함.
            });
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    callStudyItem = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.id);
        const body = await response.json();
        return body;
    }
    
    setReloads(){
        setTimeout(function() { 
          window.location.reload();
        }, 100);
    }

    make_menu = () =>{
        let menu_list = ['Schedule', '스터디 멤버', '출석', '퀴즈', '계좌 이용 내역'];

        for(let i = 0; i < menu_list.length; i++){
            $("#selected_menu").append('<option>' + menu_list[i] + '</option>');
        }
    }

    handleFormSubmit = (e) => {
        e.preventDefault();
    }

    handleValueChange = (e) => {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);

        if(nextState.selected_menu === "스터디 멤버"){
            this.props.history.push('/community/'+this.props.id+'/joinMembers');
            sessionStorage.setItem("selected_menu", "스터디 멤버");
        }

        else if(nextState.selected_menu === "Schedule"){
            this.props.history.push('/community/'+sessionStorage.getItem("enterStudyid")+'/communitySchedule');
            sessionStorage.setItem("selected_menu", "Schedule");
        }

        else if(nextState.selected_menu === "출석"){
            this.props.history.push('/community/'+this.props.id+'/attendanceCheck');
            sessionStorage.setItem("selected_menu", "출석");
        }

        else if(nextState.selected_menu === "퀴즈"){
            this.props.history.push('/community/'+this.props.id+'/aboutQuiz');
            sessionStorage.setItem("selected_menu", "퀴즈");
        }

        else if(nextState.selected_menu === "계좌 이용 내역"){
            this.props.history.push('/community/'+this.props.id+'/coinManagement');
            sessionStorage.setItem("selected_menu", "계좌 이용 내역");
        }

        this.setReloads();
    }
    
    render() {
        return (
            <div className="communityMenu_out_div_app">
                <div style={{marginTop: 10}} className = "communityMenu_container">
                    <nav className="communityMenuBar_wrapper">
                        <form className="menu_make_form" onSubmit={this.handleFormSubmit}>
                            <div className="menu_make_form_group">
                                <select 
                                    className="form-control" 
                                    id="selected_menu" 
                                    name='selected_menu' 
                                    value={this.state.selected_menu} 
                                    onChange={this.handleValueChange}>
                                </select>
                            </div>
                        </form>
                    </nav>
                </div>
            </div>
        );
    }
}

export default CommunityMenu;