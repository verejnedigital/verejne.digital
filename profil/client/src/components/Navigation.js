import React from 'react';
import './Navigation.css';

const Navigation = () =>
  (
    <nav className="sidebarnav navbar">
      <div className="navbar-header" id="world-top">
        <button
          type="button" className="navbar-toggle"
          data-toggle="collapse" data-target=".navbar-collapse"
        >
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <h1 className="navbar-brand"><span className="bolder">profil</span>.verejne.digital</h1>
        <h3 className="sub_title">Majetok poslancov podľa priznaní a katastra</h3>
      </div>
      <div className="collapse navbar-collapse">
        <ul className="nav navbar-nav">
          <li><a href="https://verejne.digital">verejne.digital</a></li>
          <li><a href="https://obstaravania.verejne.digital">obstaravania.verejne.digital</a></li>
          <li><a href="https://prepojenia.verejne.digital">prepojenia.verejne.digital</a></li>
          <li><a href="http://www.facebook.com/verejne.digital" target="_blank" rel="noopener noreferrer">kontaktuj nás na Facebooku</a></li>
          <li><a
          href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
          target="_blank">o projekte</a></li>
        </ul>
      </div>
    </nav>
  );


export default Navigation;
