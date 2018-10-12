// @flow
import React from 'react'
import Politician from './Politician'
import {Table} from 'reactstrap'
import {isItCandidatesList} from '../utilities'
import PoliticiansListWrapper from './PoliticiansListWrapper'
import {withRouter} from 'react-router-dom'
import {compose} from 'redux'
import './PoliticiansList.css'

import type {Politician as PoliticianType} from '../../../state'
import type {RouterHistory} from 'react-router'

type PoliticianListProps = {
  politicians: Array<PoliticianType>,
  history: RouterHistory,
}

const PoliticiansList = ({politicians, history}: PoliticianListProps) => (
  <Table id="politicians-table">
    <thead>
      <tr>
        <th />
        <th />
        <th className="text-left column-title">Meno a priezvisko</th>
        {!isItCandidatesList(history.location.search) && (
          <th className="text-left column-title">Obdobie</th>
        )}
        {!isItCandidatesList(history.location.search) && (
          <th className="party-column column-title">Strana</th>
        )}
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
  withRouter
)(PoliticiansList)
