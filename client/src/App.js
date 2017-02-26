import React, { Component } from 'react';
import PrepojeniaPage from './components/prepojenia/PrepojeniaPage';
import './styles/shared-menu-colors.css';
import './styles/app.css';

class App extends Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="navbar-header" id="world-top">
            <button
              type="button" className="navbar-toggle pull-left"
              data-toggle="collapse" data-target=".navbar-collapse"
            >
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand">prepojenia.verejne.digital</a>
            <span className="badge beta">beta</span>
          </div>
          <div className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li><a href="../index.html">verejne.digital</a></li>
              <li><a href="http://www.facebook.com/verejne.digital" target="_blank" rel="noopener noreferrer">kontaktuj nás na Facebooku</a></li>
              <li><a href="../obstaravania/index.html">obstaravania.verejne.digital</a></li>
            </ul>
          </div>
        </nav>
        <PrepojeniaPage location={this.props.location} />
      </div>
    );
  }
}

export default App;
