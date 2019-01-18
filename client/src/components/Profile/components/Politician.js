// @flow
import React from 'react'
import {withHandlers} from 'recompose'
import {NavLink, type ContextRouter} from 'react-router-dom'

import {getTerm} from '../utilities'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {isItCandidatesListSelector} from '../../../selectors'
import type {Politician as PoliticianType, State} from '../../../state'

type PoliticianProps = {
  politician: PoliticianType,
  useDefaultPicture: Function,
  isItCandidatesList: boolean,
}

const Politician = ({politician, useDefaultPicture, isItCandidatesList, income}: PoliticianProps) => (
  <tr className="table-line">
    <td className="number-column">{politician.order}.</td>
    <td className="photo-column">
      <img
        alt="foto"
        className="thumb-photo"
        src={`https://verejne.digital/resources/profil_pics/${politician.surname}_${
          politician.firstname
        }.jpg`}
        onError={useDefaultPicture}
      />
    </td>
    <td className="text-left">
      <NavLink to={`/profil/${politician.id}`}>
        {politician.firstname} {politician.surname}
      </NavLink>
    </td>
    {!isItCandidatesList && (
      <td className="text-left party-column">
        {!politician.term_start && '\t'}
        {getTerm(politician)}
      </td>
    )}
    {!isItCandidatesList && <td className="party-column">{politician.party_abbreviation}</td>}
    <td className="number-column">{politician.num_houses_flats}</td>
    <td className="number-column">{politician.num_fields_gardens}</td>
    <td className="number-column">{politician.num_others}</td>
    <td className="number-column">{politician.latest_income} €</td>
  </tr>
)

export default compose(
  withRouter,
  connect((state: State, props: ContextRouter) => ({
    isItCandidatesList: isItCandidatesListSelector(state, props),
  })),
  withHandlers({
    useDefaultPicture: ({history}) => (e) => {
      e.target.src = '/politician_default_s.png'
    },
  })
)(Politician)
