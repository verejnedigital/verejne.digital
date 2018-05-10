import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'
import {Collapse, Navbar, NavbarToggler, NavItem} from 'reactstrap'

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

  render = () => (
    <Navbar className="navbar-expand-lg navbar-light bg-light fixed-top">
      <NavLink to="/" className="navbar-brand">
        verejne.digital
      </NavLink>
      <NavbarToggler onClick={this.toggle} />
      <Collapse
        className="navbar-collapse"
        id="navbarSupportedContent"
        isOpen={this.state.isOpen}
        navbar
      >
        <ul className="navbar-nav mr-auto">
          <NavItem>
            <NavLink to="/verejne" className="nav-link">
              Verejne data
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/prepojenia" className="nav-link">
              Prepojenia
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/obstaravania" className="nav-link">
              Obstaravania
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/profil" className="nav-link">
              Profil
            </NavLink>
          </NavItem>
          <li className="nav-item">
            <a
              href="http://www.facebook.com/verejne.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              kontaktuj nás na Facebooku
            </a>
          </li>
          <li className="nav-item">
            <a
              href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              o projekte
            </a>
          </li>
        </ul>
      </Collapse>
    </Navbar>
  )
}

export default Navigation
