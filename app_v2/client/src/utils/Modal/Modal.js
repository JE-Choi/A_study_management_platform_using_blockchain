import React, { Component } from 'react';
import $ from 'jquery';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';

class Modal extends Component {
  state = {
    convert_to_ether_num:''
  };

  handleValueChange = (e) => {
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }
  handleFormSubmit = (e)=>{
    e.preventDefault();

    if(this.checkEther() === true) {
      this.props.displayModal(false, this.state.convert_to_ether_num);
    } 
    else {
      this.reInputConfirm();
    }
  }
  modal_cancel = () =>{
    this.props.displayModal(false);
  }

  // 입력 유무 판단
  checkEther(){
    let ether_num = $('#convert_to_ether_num').val();

    if(ether_num !== '') {
      return true;
    } 
    else {
      return false;
    }                                   
  }

  // Ether 다시 입력 안내
  reInputConfirm = () => {
    confirmAlert({
      title: '다시 입력해주세요',
      buttons: [
        { label: '확인' }
      ]
    })
  }

  render() {
    return (
    <div className="modal_layer"> 
        <div className="modal_body">
        <div className = "modal_cancel" onClick = {this.modal_cancel}>x</div>
          <div className = "modal_div">
            <h5>{this.props.title}</h5>
            <h6>충전하실 Ether를 입력해 주세요.</h6>
            <div className="sub_msg">
              <form className="form"  onSubmit={this.handleFormSubmit}>
                <input type="number" className="form-control" id="convert_to_ether_num" placeholder = "10" 
                    name='convert_to_ether_num' value={this.state.convert_to_ether_num} onChange={this.handleValueChange} />
                <button type="submit" className="btn btn-outline-primary btn-lg btn-block " id="convert_to_ether_btn">충전</button>
              </form>
            </div>
            
            <div className = "add_msg">*스터디가 시작될 때 수수료가 발생하므로, 
            <br/>가입 코인+1코인 이상 충전해야  <br className = "add_msg_br"/>정상적인 스터디 시작이 가능합니다.*</div>
          </div> 
        </div>
      </div>
    );
  }
}

export default Modal;
