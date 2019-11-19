import React, { Component } from 'react';
import Modal from './Modal';
import './styles.css';

class index extends Component {
  render() {
    return (
      <div>
        <Modal title = {this.props.title} displayModal = {this.props.displayModal}/>
      </div>
    );
  }
}

export default index;
