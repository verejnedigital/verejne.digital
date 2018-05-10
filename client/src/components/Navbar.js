import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'

class Navbar extends Component {
  render = () => (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <NavLink to="/" className="navbar-brand">
        verejne.digital
      </NavLink>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#applicationsNavbar" aria-controls="applicationsNavbar" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="applicationsNavbar">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink to="/verejne" className="nav-link">
              Verejne data
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/prepojenia" className="nav-link">
              Prepojenia
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/obstaravania" className="nav-link">
              Obstaravania
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
