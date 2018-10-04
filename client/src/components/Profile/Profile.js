// @flow
import React from 'react'
import {compose} from 'redux'
import {map} from 'lodash'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {withRouter} from 'react-router-dom'
import {updateValue} from '../../actions/sharedActions'
import {profileQuerySelector, politicianGroupSelector} from '../../selectors/profileSelectors'
import PoliticiansList from './components/PoliticiansList'
import {FACEBOOK_LIKE_SRC} from '../../constants'
import {Row, Col, Container, Button} from 'reactstrap'
import {getQueryFromGroup} from './utilities'

import './Profile.css'

import type {RouterHistory, ContextRouter} from 'react-router'
import type {State} from '../../state'

export type ProfileProps = {
  query: string,
  politicianGroup: string,
  updateQuery: (e: Event) => void,
  updateGroup: (group: string) => void,
  history: RouterHistory,
}

const groupFilter = {
  all: 'Poslanci a verejni funkcionari',
  candidates_2018_bratislava_mayor: 'Kandidati na primatora Bratislavy',
  candidates_2019_president: 'Prezidentski kandidati',
}

const Profile = ({query, politicianGroup, updateQuery, updateGroup}: ProfileProps) => (
  <Container className="Profile">
    <Row tag="header" key="header" className="header profile-header">
      <Col>
        <h1 className="title">
          <span className="bolder">profil</span>
          .verejne.digital
        </h1>
        <h3 className="sub-title">
          Majetok poslancov a verejných funkcionárov podľa priznaní a katastra
        </h3>
      </Col>
    </Row>
    <Row key="search" className="profile-search">
      <Col className="search-form">
        <input
          id="search"
          className="form-control search-input"
          type="text"
          value={query}
          onChange={updateQuery}
          placeholder="Meno a priezvisko alebo politická strana"
        />
      </Col>
    </Row>
    <Row>
      <Col className="justify-content-center d-flex flex-wrap">
        {map(groupFilter, (text, key) => (
          <Button
            key={key}
            active={politicianGroup === key}
            color="light"
            className="my-1 profile-group-button"
            onClick={() => updateGroup(key)}
          >
            {text}
          </Button>
        ))}
      </Col>
    </Row>
    <Row key="fb" className="profile-fbframe mt-2">
      <Col>
        <iframe
          title="fb_like"
          src={FACEBOOK_LIKE_SRC}
          width="201"
          height="23"
          className="fbIframe"
          scrolling="no"
          frameBorder="0"
        />
      </Col>
    </Row>
    <Row tag="article" key="politicians" className="profile">
      <Col>
        <PoliticiansList />
      </Col>
    </Row>
  </Container>
)

export default compose(
  withRouter,
  connect(
    (state: State, props: ContextRouter) => ({
      query: profileQuerySelector(state),
      politicianGroup: politicianGroupSelector(state, props),
    }),
    {updateValue}
  ),
  withHandlers({
    updateQuery: ({updateValue}) => (e) => {
      updateValue(['profile', 'query'], e.target.value)
    },
    updateGroup: ({history}) => (newGroup: string) => {
      history.push(`?group=${getQueryFromGroup(newGroup)}`)
    },
  })
)(Profile)
