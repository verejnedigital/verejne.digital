import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'
import {Collapse, Navbar, NavbarToggler, NavItem} from 'reactstrap'

import FbIcon from 'react-icons/lib/fa/facebook-square'

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
    <Navbar className="navbar-expand-lg navbar-light bg-light fixed-top navbar">
      <NavLink to="/" className="navbar-brand">
        <b>verejne</b>.digital
      </NavLink>
      <div className="navigation__container">
        <NavbarToggler onClick={this.toggle} />
        <Collapse
          className="navbar-collapse"
          id="navbarSupportedContent"
          isOpen={this.state.isOpen}
          navbar
        >
          <ul className="navbar-nav mr-auto">
            <NavItem>
              <NavLink
                to="/verejne"
                activeClassName="is-active"
                className="nav-link navigation__link"
              >
                Verejne data
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/prepojenia"
                activeClassName="is-active"
                className="nav-link navigation__link"
              >
                Prepojenia
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/obstaravania"
                activeClassName="is-active"
                className="nav-link navigation__link"
              >
                Obstaravania
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/profil"
                activeClassName="is-active"
                className="nav-link navigation__link"
              >
                Profil
              </NavLink>
            </NavItem>
          </ul>
        </Collapse>
        <div className="navigation__contact-container">
          <a
            href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            O projekte
          </a>
          <a
            href="http://www.facebook.com/verejne.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Kontakt <FbIcon />
          </a>
        </div>
      </div>
    </Navbar>
  )
}

export default Navigation
