import React, {Component} from 'react'
import Card from './Card'
import {NavLink} from 'react-router-dom'
import './Landing.css'

class Landing extends Component {
  render = () => (
    [
      <main key="main" role="main" className="container landing">
        <h1><b>verejne.</b>digital</h1>
        <p className="lead">Aplikácia umelej inteligencie na dáta slovenských verejných inštitúcii</p>
        <div className="row">
          <div className="col">
            <NavLink
              to="/verejne"
              className="card-link"
            >
              <Card
                title="Verejné dáta"
                text="Obchodujú moji susedia so štátom alebo čerpajú eurofondy?"
                imgSrc="/map.png"
              />
            </NavLink>
          </div>
          <div className="col">
            <NavLink
              to="/prepojenia"
              className="card-link"
            >
              <Card
                title="Prepojenia"
                text="Sú víťazi verejných obstarávaní prepojení na politokov?"
                imgSrc="connections.png"
              />
            </NavLink>
          </div>
          <div className="col">
            <NavLink
              to="/obstaravania"
              className="card-link"
            >
              <Card
                title="Obstarávania"
                text="Vyhrávajú firmy, ktoré sú v strate alebo založené len pár dní vopred?"
                imgSrc="search.png"
              />
            </NavLink>
          </div>
        </div>
      </main>,
      <footer key="footer" className="footer">
        <div className="container">
          <p className="float-right">
            <ul className="list-inline">
              <li className="list-inline-item">
                <a href="#"><img src="/tis.png" alt="Transparenty international slovakia" /></a>
              </li>
              <li className="list-inline-item">
                <a href="#"><img src="/slovenko.png" alt="slovenko.digital" /></a>
              </li>
              <li className="list-inline-item">
                <a href="#"><img src="/finstat.png" alt="FinStat" /></a>
              </li>
            </ul>
          </p>
          <p>
            <ul className="list-inline">
              <li className="list-inline-item list-inline-item-text">
                <a href="#">O projekte</a>
              </li>
              <li className="list-inline-item list-inline-item-text">
                <a href="#">Kontaktujte nás cez facebook</a>
              </li>
            </ul>
          </p>
        </div>
      </footer>,
    ]
  )
}

export default Landing
