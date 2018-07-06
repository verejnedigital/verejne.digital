import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'
import {Collapse} from 'reactstrap'

import './Navigation.css'

class Navigation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    }
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render = () => [
    <header key="header" className="main-header">
      <img src="/SKico.png" alt="logo" title="verejne.digital logo" />
      <h1>verejne<span>.digal</span></h1>
      <button
        key="button"
        className="navbar-toggle"
        onClick={this.toggle}
      >
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </button>
    </header>,
    <Collapse
      isOpen={this.state.isOpen}
      tag="nav"
      key="navigation"
      className="nav"
      id="mainMenu"
    >
      <div className="navigation-item">
        <NavLink to="/verejne" className="nav-link">
          Verejne data
        </NavLink>
      </div>
      <div className="navigation-item">
        <NavLink to="/prepojenia" className="nav-link">
          Prepojenia
        </NavLink>
      </div>
      <div className="navigation-item">
        <NavLink to="/obstaravania" className="nav-link">
          Obstaravania
        </NavLink>
      </div>
      <div className="navigation-item">
        <NavLink to="/profil" className="nav-link">
          Profil
        </NavLink>
      </div>
      <div className="navigation-item">
        <a
          href="http://www.facebook.com/verejne.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
        >
          kontaktuj nás na Facebooku
        </a>
      </div>
      <div className="navigation-item">
        <a
          href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
        >
          o projekte
        </a>
      </div>
    </Collapse>,
  ]
}

export default Navigation
