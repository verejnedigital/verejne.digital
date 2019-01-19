// @flow
import React from 'react'
import Politician from './Politician'
import {Table} from 'reactstrap'
import PoliticiansListWrapper from './PoliticiansListWrapper'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {isItCandidatesListSelector} from '../../../selectors'
import './PoliticiansList.css'

import type {ContextRouter} from 'react-router-dom'
import type {Politician as PoliticianType, State} from '../../../state'

type PoliticianListProps = {
  politicians: Array<PoliticianType>,
  isItCandidatesList: boolean,
}

const PoliticiansList = ({politicians, isItCandidatesList}: PoliticianListProps) => (
  <Table id="politicians-table">
    <thead>
      <tr>
        <th />
        <th />
        <th className="text-left column-title">Meno a priezvisko</th>
        {!isItCandidatesList && <th className="party-column column-title">Strana</th>}
        <th className="number-column column-title">Ročný príjem</th>
        <th className="number-column column-title" title="Domy, byty a iné stavby">
          Stavby
        </th>
        <th className="number-column column-title">Orná pôda &amp; záhrady</th>
        <th className="number-column column-title">Ostatné</th>
        
      </tr>
    </thead>
    <tbody>
      {politicians.map((politician) => (
        <Politician key={politician.id} politician={politician} />
      ))}
    </tbody>
  </Table>
)

export default compose(
  PoliticiansListWrapper,
  withRouter,
  connect((state: State, props: ContextRouter) => ({
    isItCandidatesList: isItCandidatesListSelector(state, props),
  }))
)(PoliticiansList)
