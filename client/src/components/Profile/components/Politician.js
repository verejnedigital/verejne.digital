// @flow
import React from 'react'
import {withHandlers} from 'recompose'
import {NavLink, type ContextRouter} from 'react-router-dom'

import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {isItCandidatesListSelector} from '../../../selectors'
import type {Politician as PoliticianType, State} from '../../../state'

type PoliticianProps = {
  politician: PoliticianType,
  useDefaultPicture: Function,
  isItCandidatesList: boolean,
  index: number,
}

const Politician = ({
  politician,
  useDefaultPicture,
  isItCandidatesList,
  index,
}: PoliticianProps) => (
  <tr className="table-line">
    <td className="number-column">{index + 1}.</td>
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
    {!isItCandidatesList && <td className="party-column">{politician.party_abbreviation}</td>}
    <td className="number-column">
      {politician.latest_income && politician.latest_income !== -1
        ? `${politician.latest_income.toLocaleString('sk')}  €`
        : '?'}
    </td>
    <td className="number-column">{politician.num_houses_flats}</td>
    <td className="number-column">{politician.num_fields_gardens}</td>
    <td className="number-column">{politician.num_others}</td>
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
