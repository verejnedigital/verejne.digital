// @flow
import React from 'react'
import {compose} from 'redux'
import {HashLink} from 'react-router-hash-link'
import {withState} from 'recompose'
import Typing from 'react-typing-animation'
import {Col, Row, Button, Table} from 'reactstrap'
import {FaGraduationCap, FaCopy} from 'react-icons/fa'
import {GoGraph} from 'react-icons/go'

import type {GeolocationPoint, CompanyEntity} from '../../state'
import type {RouterHistory, ContextRouter} from 'react-router-dom'
import type {HOC} from 'recompose'

import ColabList from './components/ColabList'

import './Playground.css'

export type Props = {
  history: RouterHistory,
  searchOnEnter: (e: Event) => void,
  mapProps: {center: GeolocationPoint, zoom: number},
  handleSelect: (value: string) => void,
  inputValue: string,
  onChange: () => void,
  query: string,
  suggestionEids: Array<number>,
  setInputValue: Function,
  entities: Array<CompanyEntity>,
} & ContextRouter

const Playground = ({history, typingDone, setTypingDone}) => (
  <>
    <div className="playground-background" />
    <div className="playgorund-container">
      <section id="intro" className="playground-intro-container">
        <Typing speed={20} onFinishedTyping={() => setTypingDone(true)}>
          <h1 className="display-1 playground-title-text text">
            Ihrisko
            <br />
            verejne.digital
          </h1>
        </Typing>

        <p className={`lead playground-subtitle text ${typingDone ? '' : 'hide'}`}>
          Verejné dáta vo vašich rukách.
        </p>
        <div className={`button-row ${typingDone ? '' : 'hide'}`}>
          <HashLink to="/ihrisko#list">
            <Button outline color="primary">
              <GoGraph /> Zoznam reportov
            </Button>
          </HashLink>
          <HashLink to="/ihrisko#">
            <Button outline color="primary">
              <FaGraduationCap /> Tutoriál
            </Button>
          </HashLink>
          <HashLink to="/ihrisko#">
            <Button outline color="primary">
              <FaCopy /> Vytvoriť nový report
            </Button>
          </HashLink>
          <HashLink to="/ihrisko#reference">
            <Button outline color="primary">
              <FaCopy /> API Reference
            </Button>
          </HashLink>
        </div>
      </section>
      <section id="hype" className="playground-hype-container">
        <p className="display-4 hype-text">
          Nauč sa data-science na reálnych dátach a pomáhaj odhaliť podozrivý štátny biznis.
        </p>
        <p className="subhype-text">
          V komunite je sila. Píšme kód nad rovnakými dátami. Učme sa tipy a triky od seba navzájom a umožnime
          ostatným zreporodukovať naše výsledky alebo vizualizácie.
        </p>
        <div className="playground-card-container">
          <Row>
            <Col sm={{size: 8}} className="playground-card">
              <img src="https://placeimg.com/200/200/any" alt="" />
              <div className="card-text-container">
                <h3>
                  1. Vytvor si projekt v{' '}
                  <a href="https://colab.research.google.com">Google Colab</a>
                </h3>
                <p>
                  Jednoducho pracuj s dátami v jazyku Python - výsledok vidíš online a okamžite.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8, offset: 4}} className="playground-card card-right">
              <img src="https://placeimg.com/200/200/any" alt="" />
              <div className="card-text-container card-right">
                <h3>2. Využívaj silu platformy verejne.digital</h3>
                <p>
                  Všetky agregované a predspracované dáta sú prístupné buď ako .csv súbory alebo na
                  API verejne.digital.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8}} className="playground-card">
              <img src="https://placeimg.com/200/200/any" alt="" />
              <div className="card-text-container">
                <h3>3. On the shoulders of giants</h3>
                <p>
                  Nauč sa pracovať s dátami v niektorom z interaktívnych tutoriálov alebo pokračuj
                  v niektorom z existujúcich reportov.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8, offset: 4}} className="playground-card card-right">
              <img src="https://placeimg.com/200/200/any" alt="" />
              <div className="card-text-container card-right">
                <h3>4. Vytváraj analýzy a hľadaj prepojenia</h3>
                <p>
                  Pomôž odhaliť problémy, ktoré si doteraz nikto nevšímal. Zdieľaj výsledky, kód alebo vizualizáciu na
                  verejne.digital, nech môžu ostatní pokračovať tam kde si prestal.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <section id="video" className="playground-video-container">
        <p className="display-4 video-title">Jednoduchý report vytvoríte za pár minút</p>
        <iframe width="420" height="315" src="https://www.youtube.com/embed/N0dbGGvsjf8" title="Tutorial - How to create a simple report" />
        <p className="lead video-subtitle">
          <a href="#video">Vyskúšajte si to tu.</a>
        </p>
      </section>
      <section id="list" className="playground-hype-container">
        <ColabList />
      </section>
      <section id="reference" className="playground-reference-container">
        <h2>Data</h2>
        <Table dark striped>
          <thead>
            <tr>
              <th>Meno</th>
              <th>Popis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/obstaravania.csv</code>
              </td>
              <td />
              <td>
                Základné informácie o verejných obstarávaniach
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/entities.csv</code>
              </td>
              <td />
              <td>
                Mená firiem a osôb pre nami používané eid (identifikátory entít).
              </td>
            </tr>
          </tbody>
        </Table>
        <h2>Reference</h2>
        <Table dark striped>
          <thead>
            <tr>
              <th>Názov funkcie</th>
              <th>Čo vracia?</th>
              <th>Príklad ako zavolať naše API</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>getInfos</code>
              </td>
              <td>
                Základné informácie o entite.
              </td>
              <td>
                <code>
                  <a href="#reference" className="link">
                    https://verejne.digital/api/v/getInfos?eids=103,82680,293097,389093,389094
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>a_shortest_path</code>
              </td>
              <td>
                Najkratšie spojenie medzi 2 entitami.
              </td>
              <td>
                <code>
                  <a href="#reference" className="link">
                    https://verejne.digital/prepojenia/api/p/a_shortest_path?eid1=1392540,1608323&eid2=1387739
                  </a>
                </code>
              </td>
            </tr>
          </tbody>
        </Table>
        <div className="footer-text">
          Backround svg - Free Vector Graphics by <a href="https://www.vecteezy.com">Vecteezy!</a>
        </div>
      </section>
    </div>
  </>
)

const enhance: HOC<*, Props> = compose(withState('typingDone', 'setTypingDone', false))

export default enhance(Playground)
