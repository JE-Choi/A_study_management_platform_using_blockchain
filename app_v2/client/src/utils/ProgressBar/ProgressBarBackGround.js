import React, { Component } from 'react';
import './ProgressBar.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class ProgressBarBackGround extends Component {
  state = {
    completed: 0
  }

  componentDidMount() {
    this.timer = setInterval(this.progress, 20);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  progress = () => {
    const { completed } = this.state;

    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  render() {
    return (
        <div className="progress_layer"> 
            <div className="progress_body">
                <div className = "progress_div">
                <CircularProgress variant="determinate" value={this.state.completed} />
                <div className = "message">{this.props.message}</div>
                <div className = "sub_msg_div">
                  <div className="sub_msg1">{this.props.sub_msg1}</div>
                  <div className="sub_msg2">{this.props.sub_msg2}</div>
                </div>
                </div> 
            </div>
        </div>
    );
  }
}

export default ProgressBarBackGround;