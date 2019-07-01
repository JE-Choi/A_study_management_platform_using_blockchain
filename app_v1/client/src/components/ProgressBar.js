import React, { Component } from 'react';
import './ProgressBar.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class ProgressBar extends Component {

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
    const { classes } = this.props;

    return (
        <div className = "progress_div">
          <CircularProgress variant="determinate" value={this.state.completed} />
          <h5>{this.props.message}</h5>
          <div className="sub_msg">
            {this.props.sub_msg1}<br/>
            {this.props.sub_msg2}
          </div>
          {/* {this.props.sub_msg !== '' ?
          <div>

          </div>
          :''
        } */}
        </div> 
    );
  }
}

export default ProgressBar;

