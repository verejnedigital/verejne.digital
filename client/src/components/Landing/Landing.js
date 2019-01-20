// @flow
import React from 'react'
import Card from './Card'
import {Container} from 'reactstrap'
import SearchAutocomplete from '../Search/SearchAutocomplete'
import publicDataIcon from './icons/public_data.png'
import prepojeniaIcon from './icons/prepojenia.png'
import obstaravaniaIcon from './icons/obstaravania.png'
import profilyIcon from './icons/profily.png'
import './Landing.css'

const Landing = () => (
  <div className="landing">
    <Container tag="main" role="main" className="landing-container">
      <div className="landing-head">
        <div>
          <h1 className="title landing-title">
            <b>verejne</b>.digital
          </h1>
          <p className="lead landing-lead">
            Aplikácie umelej inteligencie
            <br /> na dáta slovenských verejných inštitúcií
          </p>
        </div>
      </div>
      <SearchAutocomplete />
      <div className="landing-cards">
        <Card
          to="/verejne"
          title="Mapa"
          text="Obchodujú moji susedia alebo obchodní partneri so štátom?"
          imgSrc={publicDataIcon}
        />
        <Card
          to="/profil"
          title="Profil"
          text="Majetok verejných funkcionárov podľa priznaní a katastra."
          imgSrc={profilyIcon}
        />
        <Card
          to="/prepojenia"
          title="Prepojenia"
          text="Aké sú vzťahy medzi firmami a osobami?"
          imgSrc={prepojeniaIcon}
        />
        <Card
          to="/obstaravania"
          title="Obstarávania"
          text="Do ktorých výziev sa prihlásiť a ktoré sú podozrivé?"
          imgSrc={obstaravaniaIcon}
        />
        {/* TODO: Change CSS for card after uncommenting Ihrisko card. */}
        {/* <Card
          to="/ihrisko"
          title="Ihrisko"
          text="Hrajte sa s nasimi dátami!"
          imgSrc={obstaravaniaIcon}
        /> */}
      </div>
    </Container>
    <footer className="landing-footer">
      <Container>
        <div style={{float: 'left'}}>
          <ul className="list-inline" style={{marginBottom: 0}}>
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
          <span className="gray">Prevádzkovateľ</span>
          <a href="http://chcemvediet.sk" target="_blank" rel="noopener noreferrer">
            <img src="/chv.png" alt="chcemvediet.sk" />
          </a>
        </div>
        <div style={{float: 'right'}}>
          <span className="gray">Partneri</span>
          <ul className="list-inline">
            <li className="list-inline-item">
              <a href="https://slovensko.digital/" target="_blank" rel="noopener noreferrer">
                <img src="/slovenko.png" alt="slovenko.digital" />
              </a>
            </li>
            <li className="list-inline-item">
              <a href="https://www.zastavmekorupciu.sk/" target="_blank" rel="noopener noreferrer">
                <img src="/nzk.png" alt="Nadácia Zastavme Korupciu" />
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
        </div>
      </Container>
    </footer>
  </div>
)

export default Landing
