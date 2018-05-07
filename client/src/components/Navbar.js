import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'

import './Navbar.css'

class Navbar extends Component {
  render = () => (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <NavLink to="/" className="navbar-brand">
        verejne.digital
      </NavLink>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
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
          <li className="nav-item">
            <NavLink to="/profil" className="nav-link">
              Profil
            </NavLink>
          </li>
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
      </div>
    </nav>
  )
}

export default Navbar
