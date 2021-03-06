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
import giant_2 from '../../assets/giant_2.svg'
import pencils_2 from '../../assets/pencils_2.svg'
import megaphone_2 from '../../assets/megaphone_2.svg'
import graph_2 from '../../assets/graph_2.svg'

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
          <HashLink to="/ihrisko#video">
            <Button outline color="primary">
              <FaGraduationCap /> Tutoriál
            </Button>
          </HashLink>
          <HashLink to="/ihrisko#video">
            <Button outline color="primary">
              <FaCopy /> Vytvoriť nový report
            </Button>
          </HashLink>
          <HashLink to="/ihrisko#reference">
            <Button outline color="primary">
              <FaCopy /> Data a API Reference
            </Button>
          </HashLink>
          <a href="https://platforma.slovensko.digital/t/verejne-digital-ihrisko-nauc-sa-data-science-na-realnych-datach/6183" target="_blank" rel="noopener noreferrer">
            <Button outline color="primary">
              <FaCopy /> Diskusné fórum
            </Button>
          </a>
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
              <img src={pencils_2} alt="" />
              <div className="card-text-container">
                <h3>
                  1. Vytvor si report v{' '}
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
              <img src={graph_2} alt="" />
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
              <img src={giant_2} alt="" />
              <div className="card-text-container">
                <h3>3. On the shoulders of giants</h3>
                <p>
                  Nauč sa pracovať s dátami, pomôž odhaliť problémy, alebo pokračuj
                  v niektorom z existujúcich reportov.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={{size: 8, offset: 4}} className="playground-card card-right">
              <img src={megaphone_2} alt="" />
              <div className="card-text-container card-right">
                <h3>4. <a href="https://docs.google.com/forms/d/e/1FAIpQLSet5WM8uWGvhT7WQ3Tyr8tV7LDaBdPsFEvMRU5ILUXBjVhopw/viewform" target="_blank" rel="noopener noreferrer">
                    Zdieľaj
                  </a>{' '}  svoje výsledky s ostatnými</h3>
                <p>
                  Zdieľaj svoje výsledky, kód alebo vizualizáciu na
                  verejne.digital, nech môžu ostatní pokračovať tam kde si prestal(a). Podeľ sa s nápadmi na{' '}<a href="https://platforma.slovensko.digital/t/verejne-digital-ihrisko-nauc-sa-data-science-na-realnych-datach/6183" target="_blank" rel="noopener noreferrer">diskusnom fóre</a>.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <section id="video" className="playground-video-container">
        <p className="display-4 video-title">
          Jednoduchý report vytvoríte za pár minút. {' '}
          <a href="https://colab.research.google.com/drive/1EliPM69jvvtwoVJU-efP5K2bOX28XIlt" target="_blank" rel="noopener noreferrer">
            Vyskúšajte si to tu.
          </a>
        </p>
        <iframe width="420" height="315" src="https://www.youtube.com/embed/inN8seMm7UI" title="Tutorial - How to create a simple report" />
        <p className="lead video-subtitle">
          Vlastný video tutoriál ešte len plánujeme, tak zatiaľ si môžete pozrieť viac o prostredí Google Colab.
        </p>
      </section>
      <section id="list" className="playground-hype-container">
        <ColabList />
        <a href="https://colab.research.google.com/drive/1EliPM69jvvtwoVJU-efP5K2bOX28XIlt" target="_blank" rel="noopener noreferrer">
          <div className="playground-new-report-button">
            <Button outline color="primary">
              <FaCopy /> Vytvoriť nový report
            </Button>
          </div>
        </a>     
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSet5WM8uWGvhT7WQ3Tyr8tV7LDaBdPsFEvMRU5ILUXBjVhopw/viewform" target="_blank" rel="noopener noreferrer">
          <div className="playground-new-report-button">
            <Button outline color="primary">
              <FaCopy /> Zdieľať report
            </Button>
          </div>
        </a>   
      </section>
      <section id="reference" className="playground-reference-container">
        <h2>Data</h2>
        <Table dark striped>
          <thead>
            <tr>
              <th>Prepojené dáta na používanie</th>
              <th></th>
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
                <code>https://verejne.digital/resources/csv/contracts.csv</code>
              </td>
              <td />
              <td>
                Základné informácie o zverejnených zmluvách.
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/eurofondy.csv</code>
              </td>
              <td />
              <td>
                Základné informácie o eurofondových výzvach.
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/entities.csv</code>
              </td>
              <td />
              <td>
                Mená firiem a osôb pre nami používané identifikátory entít (eid).
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/related.csv</code>
              </td>
              <td />
              <td>
                Vzťahy medzi entitami, ich typ a časová platnosť.
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/companies.csv</code>
              </td>
              <td />
              <td>
                IČO, vznik a zánik firiem pre dané identifikátory entít (eid).
              </td>
            </tr>
            <tr>
              <td>
                <code>https://verejne.digital/resources/csv/offices.csv</code>
              </td>
              <td />
              <td>
                Pôsobenie politikov v politických stranách a funkciách.
              </td>
            </tr>
          </tbody>
        </Table>
        <h2>API Reference</h2>
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
                <code>searchEntityByName</code>
              </td>
              <td>
                Nájde osoby a firmy s týmto menom.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/v/searchEntityByName?name=stefan%20skrucany" className="link" target="_blank" rel="noopener noreferrer">
                    https://verejne.digital/api/v/searchEntityByName?name=stefan%20skrucany
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>searchEntityByIco</code>
              </td>
              <td>
                Nájde firmy a podnikateľov podľa ich IČO.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/v/searchEntityByIco?ico=42258910" className="link" target="_blank" rel="noopener noreferrer">
                    https://verejne.digital/api/v/searchEntityByIco?ico=42258910
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>getInfos</code>
              </td>
              <td>
                Základné informácie o entite.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/v/getInfos?eids=103,82680,293097,389093,389094" className="link" target="_blank" rel="noopener noreferrer">
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
                Najkratšie spojenie medzi entitami.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/p/a_shortest_path?eid1=1392540,1608323&eid2=1387739" className="link" target="_blank" rel="noopener noreferrer">
                    https://verejne.digital/api/p/a_shortest_path?eid1=1392540,1608323&eid2=1387739
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>list_politicians</code>
              </td>
              <td>
                Zoznam aktívnych politikov.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/k/list_politicians?group=active" className="link" target="_blank" rel="noopener noreferrer">
                    	https://verejne.digital/api/k/list_politicians?group=active
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>info_politician</code>
              </td>
              <td>
                Info o vybranom politikovi.
              </td>
              <td>
                <code>
                  <a href="https://verejne.digital/api/k/info_politician?id=40" className="link" target="_blank" rel="noopener noreferrer">
                    	https://verejne.digital/api/k/info_politician?id=40
                  </a>
                </code>
              </td>
            </tr>
          </tbody>
        </Table>
        <h2>Externé zdroje dát (z viacerých čerpáme aj my)</h2>
        <Table dark striped>
          <thead>
            <tr>
              <th>Zdroj dát</th>              
            </tr>
          </thead>
          <tbody>            
            <tr>
              <td>
                <code>
                  <a href="https://ekosystem.slovensko.digital/" className="link" target="_blank" rel="noopener noreferrer">
                    https://ekosystem.slovensko.digital/
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>
                  <a href="https://www.uvostat.sk/download" className="link" target="_blank" rel="noopener noreferrer">
                    https://www.uvostat.sk/download
                  </a>
                </code>
              </td>
            </tr>  
            <tr>
              <td>
                <code>
                  <a href="https://data.gov.sk/" className="link" target="_blank" rel="noopener noreferrer">
                    https://data.gov.sk/
                  </a>
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>
                  <a href="https://api.otvorenesudy.sk/" className="link" target="_blank" rel="noopener noreferrer">
                    https://api.otvorenesudy.sk/
                  </a>
                </code>
              </td>
            </tr>  
          </tbody>
        </Table>
        <div className="footer-text">
          Backround svg - Free Vector Graphics by&nbsp;<a href="https://www.vecteezy.com">Vecteezy!</a>
        </div>
        <div className="footer-text">
          Icons made by&nbsp;<a href="https://www.freepik.com/" title="Freepik">Freepik</a>&nbsp;from
          &nbsp;<a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>&nbsp;
          is licensed by
          &nbsp;<a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a>
        </div>
      </section>
    </div>
  </>
)

const enhance: HOC<*, Props> = compose(withState('typingDone', 'setTypingDone', false))

export default enhance(Playground)
