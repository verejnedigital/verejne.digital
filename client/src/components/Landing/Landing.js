import React, {Component} from 'react'
import Card from './Card'
import './Landing.css'
import {Row, Col, Container} from 'reactstrap'
import publicDataIcon from './icons/public_data.png'
import prepojeniaIcon from './icons/prepojenia.png'
import obstaravaniaIcon from './icons/obstaravania.png'
import profilyIcon from './icons/profily.png'

class Landing extends Component {
  render() {
    return (
      <div className="landing">
        <Container tag="main" role="main" className="landing-container">
          <h1 className="title landing-title">
            <b>verejne</b>.digital
          </h1>
          <p className="lead landing-lead">
            Aplikácie umelej inteligencie<br /> na dáta slovenských verejných inštitúcií
          </p>
          <Row className="landing-cards">
            <Col md="6" lg="3">
              <Card
                to="/verejne"
                title="Verejné dáta"
                text="Obchodujú moji susedia alebo obchodní partneri so štátom?"
                imgSrc={publicDataIcon}
              />
            </Col>
            <Col md="6" lg="3">
              <Card
                to="/prepojenia"
                title="Prepojenia"
                text="Aké sú vzťahy medzi firmami a osobami?"
                imgSrc={prepojeniaIcon}
              />
            </Col>
            <Col md="6" lg="3">
              <Card
                to="/obstaravania"
                title="Obstarávania"
                text="Do ktorých výziev sa prihlásiť a ktoré sú podozrivé?"
                imgSrc={obstaravaniaIcon}
              />
            </Col>
            <Col md="6" lg="3">
              <Card
                to="/profil"
                title="Profily"
                text="Majetok poslancov podľa priznaní a katastra."
                imgSrc={profilyIcon}
              />
            </Col>
          </Row>
        </Container>
        <footer className="landing-footer">
          <div className="container">
            <ul className="float-md-right list-inline">
              <li className="list-inline-item">
                <a href="https://www.zastavmekorupciu.sk/">
                  <img src="/nzk.png" alt="Nadácia Zastavme Korupciu" />
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
            <ul className="float-md-left list-inline landing-footer-text">
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
        </footer>
      </div>
    )
  }
}

export default Landing
