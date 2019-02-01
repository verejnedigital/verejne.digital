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
              <FaCopy /> Vytvoriť nový Report
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In congue sed sem at maximus. Sed
          vel eros in neque ultrices pulvinar non id ipsum. Etiam mattis metus id tincidunt commodo.
          Suspendisse potenti.
        </p>
        <div className="playground-card-container">
          <Row>
            <Col sm={{size: 8}} className="playground-card">
              <img src="https://placeimg.com/200/200/any" />
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
              <img src="https://placeimg.com/200/200/any" />
              <div className="card-text-container card-right">
                <h3>2. Využívaj silu platformy verejne.digital</h3>
                <p>
                  Všetky agregované a predspracované dáta sú prístupné buď ako .csv súbory, alebo na
                  API verejne.digital.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8}} className="playground-card">
              <img src="https://placeimg.com/200/200/any" />
              <div className="card-text-container">
                <h3>3. On the shoulders of giants</h3>
                <p>
                  Nauč sa pracovať s dátami v niektorom z interaktívnych tutoriálov, alebo pokračuj
                  v niektorom z existujúcich reportov.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8, offset: 4}} className="playground-card card-right">
              <img src="https://placeimg.com/200/200/any" />
              <div className="card-text-container card-right">
                <h3>4. vytváraj analýzi a hľadaj prepojenia</h3>
                <p>
                  Pomôž odhaliť problémy, ktoré si doteraz nikto nevšímal. Zdieľaj výsledky na
                  verejne.digital, blah blah daco..
                </p>
              </div>
            </Col>
          </Row>
        </div>
        <p className="bottom-hype-text">
          TODO Call to Action -> tutorial, prazdny collab alebo zoznam existujucich
        </p>
      </section>
      <section id="video" className="playground-video-container">
        <p className="display-4 video-title">Jednoduchý report vytvoríte za pár minút</p>
        <iframe width="420" height="315" src="https://www.youtube.com/embed/N0dbGGvsjf8" />
        <p className="lead video-subtitle">
          <a href="#">Vyskúšajte si to tu.</a>
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
                <code>Table</code>
              </td>
              <td />
              <td>
                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                varius blandit.
              </td>
            </tr>
            <tr>
              <td>
                <code>Table</code>
              </td>
              <td />
              <td>
                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                varius blandit.
              </td>
            </tr>
          </tbody>
        </Table>
        <h2>Reference</h2>
        <Table dark striped>
          <thead>
            <tr>
              <th>Url</th>
              <th>Payload</th>
              <th>Popis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>
                  <a href="#" className="link">
                    /api/daco$ids
                  </a>
                </code>
              </td>
              <td>
                <code>ids: number[]</code>
              </td>
              <td>
                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                varius blandit.
              </td>
            </tr>
            <tr>
              <td>
                <a href="#">
                  <code>/api/daco$ids</code>
                </a>
              </td>
              <td>
                <code>ids: number[]</code>
              </td>
              <td>
                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                varius blandit.
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
