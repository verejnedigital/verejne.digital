// @flow
import React from 'react'
import {compose, withHandlers, withState} from 'recompose'
import {connect} from 'react-redux'
import {refreshState} from '../actions/sharedActions'
import {NavLink} from 'react-router-dom'
import {Collapse, Navbar, NavbarToggler, NavItem, Nav, Badge} from 'reactstrap'

import {FaFacebookSquare} from 'react-icons/fa'

import './Navigation.css'

type Props = {
  navigationOpen: boolean,
  toggleNavigation: (open: boolean) => void,
  closeNavigation: () => void,
  handleNavClick: () => void,
}

const Navigation = ({navigationOpen, toggleNavigation, closeNavigation, handleNavClick}: Props) => (
  <Navbar light expand="lg">
    <NavLink to="/" className="navbar-brand">
      <b>verejne</b>.digital
    </NavLink>
    <NavbarToggler onClick={toggleNavigation} />
    <Collapse isOpen={navigationOpen} navbar>
      <Nav navbar className="mr-auto">
        <NavItem>
          <NavLink to="/verejne" className="nav-link" onClick={handleNavClick}>
            Mapa
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/profil" className="nav-link" onClick={handleNavClick}>
            Profil
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/prepojenia" className="nav-link" onClick={handleNavClick}>
            Prepojenia
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/obstaravania" className="nav-link" onClick={handleNavClick}>
            Obstarávania
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/vyhladavanie" className="nav-link" onClick={handleNavClick}>
            Vyhľadávanie
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/ihrisko" className="nav-link" onClick={handleNavClick}>
            Ihrisko <Badge>Beta</Badge>
          </NavLink>
        </NavItem>
      </Nav>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <a
            href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            onClick={closeNavigation}
          >
            O projekte
          </a>
        </NavItem>
        <NavItem>
          <a
            href="http://www.facebook.com/verejne.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            onClick={closeNavigation}
          >
            Kontakt <FaFacebookSquare />
          </a>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
)

export default compose(
  withState('navigationOpen', 'setNavigationOpen', false),
  connect(
    null,
    {refreshState}
  ),
  withHandlers({
    handleNavClick: ({refreshState, setNavigationOpen}) => () => {
      refreshState()
      setNavigationOpen(false)
    },
    toggleNavigation: ({setNavigationOpen}) => () => setNavigationOpen((show) => !show),
    closeNavigation: ({setNavigationOpen}) => () => setNavigationOpen(false),
  })
)(Navigation)
