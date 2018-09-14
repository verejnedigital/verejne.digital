// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {updateValue} from '../../actions/sharedActions'
import {politiciansProvider} from '../../dataProviders/profileDataProviders'
import {profileQuerySelector, filteredPoliticiansSelector} from '../../selectors/profileSelectors'
import PoliticiansList from './components/PoliticiansList'
import {FACEBOOK_LIKE_SRC} from '../../constants'
import {Row, Col, Container} from 'reactstrap'

import './Profile.css'

import type {State, Politician} from '../../state'

export type UnenhancedProfileProps = {
  query: string,
  politicians: Array<Politician>,
  updateQuery: (e: Event) => void,
}

type ProfileProps = {
  query: string,
  updateValue: Function,
  props: UnenhancedProfileProps,
}

const UnenhancedProfile = ({query, politicians, updateQuery}: UnenhancedProfileProps) => (
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
    <Row key="fb" className="profile-fbframe">
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
        <PoliticiansList politicians={politicians} />
      </Col>
    </Row>
  </Container>
)

const Profile: HOC<*, ProfileProps> = compose(
  withDataProviders(() => [politiciansProvider()]),
  connect(
    (state: State) => ({
      query: profileQuerySelector(state),
      politicians: filteredPoliticiansSelector(state),
    }),
    {updateValue}
  ),
  withHandlers({
    updateQuery: (props) => (e) => {
      props.updateValue(['profile', 'query'], e.target.value)
    },
  })
)(UnenhancedProfile)

export default Profile
