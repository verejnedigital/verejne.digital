// @flow
import React from 'react'
import {NavLink} from 'react-router-dom'
import {compose, withState} from 'recompose'
import {Collapse, Navbar, NavbarToggler, NavItem, Nav} from 'reactstrap'

import FbIcon from 'react-icons/lib/fa/facebook-square'

import './Navigation.css'

type Props = {
  navigationOpen: boolean,
  setNavigationOpen: (open: boolean) => void,
}

//class Navigation extends Component<Props, State> {
const Navigation = ({navigationOpen, setNavigationOpen}: Props) => (
  <Navbar light expand="lg">
    <NavLink to="/" className="navbar-brand">
      <b>verejne</b>.digital
    </NavLink>
    <NavbarToggler onClick={() => setNavigationOpen(!navigationOpen)} />
    <Collapse isOpen={navigationOpen} navbar>
      <Nav navbar className="mr-auto">
        <NavItem>
          <NavLink to="/verejne" className="nav-link" onClick={() => setNavigationOpen(false)}>
            Verejné dáta
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/profil" className="nav-link" onClick={() => setNavigationOpen(false)}>
            Profil
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/prepojenia" className="nav-link" onClick={() => setNavigationOpen(false)}>
            Prepojenia
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/obstaravania" className="nav-link" onClick={() => setNavigationOpen(false)}>
            Obstarávania
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
            onClick={() => setNavigationOpen(false)}
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
            onClick={() => setNavigationOpen(false)}
          >
            Kontakt <FbIcon />
          </a>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
)

export default compose(
  withState('navigationOpen', 'setNavigationOpen', false),
)(Navigation)
