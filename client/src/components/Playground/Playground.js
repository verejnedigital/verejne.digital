// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {HashLink} from 'react-router-hash-link'
import {Container, Col, Row, Jumbotron, Button} from 'reactstrap'
import {
  FACEBOOK_LIKE_SRC,
  DEFAULT_MAP_CENTER,
  COUNTRY_ZOOM,
  MAX_ENTITY_REQUEST_COUNT,
} from '../../constants'

import type {State, GeolocationPoint, CompanyEntity} from '../../state'
import type {ContextRouter} from 'react-router-dom'
import type {HOC} from 'recompose'

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

const Playground = ({history}) => (
  <>
    <section id="intro" className="playground-intro-container">
      <Jumbotron className="playgroundhero">
        <h1 className="display-3">Ihrisko verejne.digital</h1>
        <p className="lead">
          Lorem ipsum.. co je to tu a preco je to dobre ? Co tu mozem robit ja ?
        </p>
        <hr className="my-2" />
        <p>Nie si tu prvy krat ?</p>
        <p className="lead">
          <HashLink smooth to="/ihrisko#one">
            <Button className="hero-button" color="primary">
              Referencia
            </Button>
          </HashLink>
          <HashLink smooth to="/ihrisko#two">
            <Button className="hero-button" color="primary">
              Zoznam Reportov
            </Button>
          </HashLink>
        </p>
      </Jumbotron>
      <h3>Tutorial</h3>
      <p>Par teplych slov ? Zoznam linkov ? Daco ?</p>
      <Button className="hero-button" color="primary">
        Velavyznamny link na tutorial
      </Button>
    </section>
    <section id="one" className="one">
      <h3>Referencia</h3>
      <p>DATA</p>
      <hr className="my-2" />
      <p>API</p>
      <hr className="my-2" />
    </section>
    <section id="two" className="two">
      <h3>Zoznam</h3>
      <hr className="my-2" />
    </section>
  </>
)

const enhance: HOC<*, Props> = compose(connect())

export default enhance(Playground)
