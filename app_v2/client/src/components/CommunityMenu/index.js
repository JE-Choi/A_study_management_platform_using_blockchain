import React, { Component } from 'react';
import CommunityMenu from './CommunityMenu';
import CommunityMenuApp from './CommunityMenuApp';
import './style.css';
import { BrowserRouter as Router} from 'react-router-dom';
import CommunityContents from './CommunityContents';

class index extends Component {
    render() {
        return (
            <Router>
                <div className="main_communityMenu">
                    <CommunityMenu 
                        id = {this.props.match.params.id} 
                        history = {this.props.history}
                    />
                    <CommunityMenuApp 
                        id = {this.props.match.params.id} 
                        history = {this.props.history}
                    />
                    <CommunityContents/>
                </div>
            </Router>
        );
    }
}

export default index;
