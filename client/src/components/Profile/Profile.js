// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {updateValue} from '../../actions/sharedActions'
import {profileQuerySelector, politicianGroupSelector} from '../../selectors/profileSelectors'
import PoliticiansList from './components/PoliticiansList'
import {FACEBOOK_LIKE_SRC} from '../../constants'
import {Row, Col, Container, Button, ButtonGroup} from 'reactstrap'

import './Profile.css'

import type {State} from '../../state'

export type ProfileProps = {
  query: string,
  politicianGroup: string,
  updateQuery: (e: Event) => void,
  updateGroup: (group: string) => void,
}

const Profile = ({query, politicianGroup, updateQuery, updateGroup}: ProfileProps) => (
  <Container className="Profile">
    <Row tag="header" key="header" className="header profile-header">
      <Col>
        <h1 className="title">
          <span className="bolder">profil</span>.verejne.digital
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
      <Col>
        <ButtonGroup>
          <Button onClick={() => updateGroup('all')}>all</Button>
          <Button onClick={() => updateGroup('active')}>active</Button>
          <Button onClick={() => updateGroup('nrsr_mps')}>nrsr_mps</Button>
          <Button onClick={() => updateGroup('candidates_2018_bratislava_mayor')}>candidates_2018_bratislava_mayor</Button>
          <Button onClick={() => updateGroup('candidates_2019_president')}>candidates_2019_president</Button>
        </ButtonGroup>
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
  connect(
    (state: State) => ({
      query: profileQuerySelector(state),
      politicianGroup: politicianGroupSelector(state),
    }),
    {updateValue}
  ),
  withHandlers({
    updateQuery: ({updateValue}) => (e) => {
      updateValue(['profile', 'query'], e.target.value)
    },
    updateGroup: ({updateValue}) => (newGroup: string) => {
      updateValue(['profile', 'politicianGroup'], newGroup)
    },
  })
)(Profile)
