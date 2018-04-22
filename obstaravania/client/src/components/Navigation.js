import React from 'react';
import './Navigation.css';

// For map view, we do not give red/green colors
const Navigation = () =>
  (
    <nav className="sidebarnav navbar">
      <div className="navbar-header" id="world-top">
        <button
          type="button" className="navbar-toggle"
          data-toggle="collapse" data-target=".navbar-collapse"
        >
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
        <a className="navbar-brand"><span className="bolder">obstaravania</span>.verejne.digital</a>
      </div>
      <div className="collapse navbar-collapse">
        <ul className="nav navbar-nav">
          <li><a href="../index.html">verejne.digital</a></li>
          <li><a href="../prepojenia/index.html">prepojenia.verejne.digital</a></li>
          <li><a href="../profil/index.html">profil.verejne.digital</a></li>
          <li><a href="http://www.facebook.com/verejne.digital" target="_blank" rel="noopener noreferrer">kontaktuj nás na Facebooku</a></li>
        </ul>
      </div>
    </nav>
  );


export default Navigation;
