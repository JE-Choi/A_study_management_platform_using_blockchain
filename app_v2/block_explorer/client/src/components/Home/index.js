import React from 'react';
import Home_web from './Home_web';
import Home_app from './Home_app';
import './style.css';

function index() {
  return (
    <React.Fragment>
      <Home_web/>
      <Home_app/>
    </React.Fragment>
  );
}

export default index;
