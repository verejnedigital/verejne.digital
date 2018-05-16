import React, {Component} from 'react'
import Card from './Card'
import {NavLink} from 'react-router-dom'
import './Landing.css'
import {Row, Col, Container} from 'reactstrap'

class Landing extends Component {
  render = () => [
    <Container tag="main" key="main" role="main" className="landing-page">
      <h1>
        <b>verejne.</b>digital
      </h1>
      <p className="lead">Aplikácia umelej inteligencie na dáta slovenských verejných inštitúcii</p>
      <Row>
        <Col className="col-lg-3 col-md-4 col-sm-6 col-12 card-wrapper">
          <NavLink to="/verejne" className="card-link">
            <Card
              title="Verejné dáta"
              text="Obchodujú moji susedia so štátom alebo čerpajú eurofondy?"
              imgSrc="/map.png"
            />
          </NavLink>
        </Col>
        <Col className="col-lg-3 col-md-4 col-sm-6 col-12 card-wrapper">
          <NavLink to="/prepojenia" className="card-link">
            <Card
              title="Prepojenia"
              text="Sú víťazi verejných obstarávaní prepojení na politokov?"
              imgSrc="connections.png"
            />
          </NavLink>
        </Col>
        <Col className="col-lg-3 col-md-4 col-sm-6 col-12 card-wrapper">
          <NavLink to="/obstaravania" className="card-link">
            <Card
              title="Obstarávania"
              text="Vyhrávajú firmy, ktoré sú v strate alebo založené len pár dní vopred?"
              imgSrc="search.png"
            />
          </NavLink>
        </Col>
        <Col className="col-lg-3 col-md-4 col-sm-6 col-12 card-wrapper">
          <NavLink to="/profil" className="card-link">
            <Card title="Profil" text="Majetok poslancov podľa priznaní a katastra" imgSrc="search.png" />
          </NavLink>
        </Col>
      </Row>
    </Container>,
    <footer key="footer" className="landing-footer">
      <div className="container">
        <ul className="float-md-right list-inline">
          <li className="list-inline-item">
            <a href="http://transparency.sk/sk/">
              <img src="/tis.png" alt="Transparency international slovakia" />
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://slovensko.digital/">
              <img src="/slovenko.png" alt="slovenko.digital" />
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://www.finstat.sk/">
              <img src="/finstat.png" alt="FinStat" />
            </a>
          </li>
        </ul>
        <ul className="float-md-left list-inline footer-text">
          <li className="list-inline-item list-inline-item-text">
            <a
              href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
              target="_blank"
              rel="noopener noreferrer"
            >
              O projekte
            </a>
          </li>
          <li className="list-inline-item list-inline-item-text">
            <a
              href="http://www.facebook.com/verejne.digital"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kontaktujte nás cez facebook
            </a>
          </li>
        </ul>
      </div>
    </footer>,
  ]
}

export default Landing
