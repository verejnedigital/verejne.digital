// @flow
import React, {Component} from 'react'
import {compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {updateValue} from '../actions/sharedActions'
import {refreshState} from '../utils'
import {NavLink, withRouter} from 'react-router-dom'
import {Collapse, Navbar, NavbarToggler, NavItem, Nav} from 'reactstrap'

import FbIcon from 'react-icons/lib/fa/facebook-square'

import type {RouterHistory, Location, Match} from 'react-router-dom'

import './Navigation.css'

type State = {
  isOpen: boolean,
  pathname: string,
}

type Props = {
  history: RouterHistory,
  location: Location,
  match: Match,
  refresh: () => void,
}

class Navigation extends Component<Props, State> {
  state = {
    isOpen: false,
    pathname: this.props.location.pathname,
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    // NOTE: We need to hide mobile menu when we navigate to other page.
    if (props.location.pathname !== state.pathname) {
      return {isOpen: false, pathname: props.location.pathname}
    } else {
      return {pathname: props.location.pathname}
    }
  }

  toggle = () => {
    this.setState((state) => ({
      isOpen: !state.isOpen,
    }))
  }

  render() {
    return (
      <Navbar light expand="lg">
        <NavLink to="/" className="navbar-brand" onClick={this.props.refresh}>
          <b>verejne</b>.digital
        </NavLink>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar className="mr-auto">
            <NavItem>
              <NavLink to="/verejne" className="nav-link" onClick={this.props.refresh}>
                Verejné dáta
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/profil" className="nav-link" onClick={this.props.refresh}>
                Profil
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/prepojenia" className="nav-link" onClick={this.props.refresh}>
                Prepojenia
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/obstaravania" className="nav-link" onClick={this.props.refresh}>
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
              >
                Kontakt <FbIcon />
              </a>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

export default compose(
  withRouter,
  connect(null,
    {updateValue}
  ),
  withHandlers({
    refresh: ({updateValue}) => () => {
      refreshState(updateValue)
    },
  }),
)(Navigation)
