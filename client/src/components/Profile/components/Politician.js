// @flow
import React from 'react'
import {withHandlers} from 'recompose'
import {NavLink} from 'react-router-dom'
import {getTerm, isItCandidatesList} from '../utilities'
import {withRouter} from 'react-router-dom'
import {compose} from 'redux'
import type {Politician as PoliticianType} from '../../../state'
import type {RouterHistory} from 'react-router'

type PoliticianProps = {
  politician: PoliticianType,
  useDefaultPicture: Function,
  history: RouterHistory,
}

const Politician = ({politician, useDefaultPicture, history}: PoliticianProps) => (
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
    {!isItCandidatesList(history.location.search) && (
      <td className="text-left party-column">
        {!politician.term_start && '\t'}
        {getTerm(politician)}
      </td>
    )}
    {!isItCandidatesList(history.location.search) && (
      <td className="party-column">{politician.party_abbreviation}</td>
    )}
    <td className="number-column">{politician.num_houses_flats}</td>
    <td className="number-column">{politician.num_fields_gardens}</td>
    <td className="number-column">{politician.num_others}</td>
  </tr>
)

export default compose(
  withRouter,
  withHandlers({
    useDefaultPicture: ({history}) => (e) => {
      e.target.src = '/politician_default_s.png'
    },
  })
)(Politician)
