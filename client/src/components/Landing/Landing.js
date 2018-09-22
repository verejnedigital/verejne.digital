// @flow
import React from 'react'
import Card from './Card'
import {Row, Col, Container} from 'reactstrap'
import publicDataIcon from './icons/public_data.png'
import prepojeniaIcon from './icons/prepojenia.png'
import obstaravaniaIcon from './icons/obstaravania.png'
import profilyIcon from './icons/profily.png'
import './Landing.css'

const Landing = () => (
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
            to="/profil"
            title="Profil"
            text="Majetok verejných funkcionárov podľa priznaní a katastra."
            imgSrc={profilyIcon}
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
      </Row>
    </Container>
    <footer className="landing-footer">
      <div className="container">
        <div className="float-md-left">
          <ul className="list-inline landing-footer-text">
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
        <div className="float-lg-right">
          <ul className="list-inline">
            <li className="list-inline-item partners">
              <span className="gray">Partneri</span>
              <ul className="list-inline">
                <li className="list-inline-item">
                  <a
                    href="https://www.zastavmekorupciu.sk/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/nzk.png" alt="Nadácia Zastavme Korupciu" />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://slovensko.digital/" target="_blank" rel="noopener noreferrer">
                    <img src="/slovenko.png" alt="slovenko.digital" />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://www.finstat.sk/" target="_blank" rel="noopener noreferrer">
                    <img src="/finstat.png" alt="FinStat" />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://vacuumlabs.com/" target="_blank" rel="noopener noreferrer">
                    <img src="/vl.png" alt="VacuumLabs" />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://www.uvostat.sk" target="_blank" rel="noopener noreferrer">
                    <img src="/uvo.png" alt="UVOstat" />
                  </a>
                </li>
              </ul>
            </li>
            <li className="list-inline-item">
              <span className="gray">Prevádzkovateľ</span>
              <ul className="list-inline">
                <li className="list-inline-item">
                  <a href="http://chcemvediet.sk" target="_blank" rel="noopener noreferrer">
                    <img src="/chv.png" alt="chcemvediet.sk" />
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
)

export default Landing
