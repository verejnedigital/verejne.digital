// @flow
import React from 'react'
import Politician from './Politician'
import {Table} from 'reactstrap'

import './PoliticiansList.css'

import type {Politician as PoliticianType} from '../../../state'

type PoliticianListProps = {
  politicians: Array<PoliticianType>,
}

const PoliticiansList = ({politicians}: PoliticianListProps) => (
  <Table id="politicians-table">
    <thead>
      <tr>
        <th />
        <th />
        <th className="text-left column-title">Meno a priezvisko</th>
        <th className="text-left column-title">Obdobie</th>
        <th className="party-column column-title">Strana</th>
        <th className="number-column column-title" title="Domy, byty a iné stavby">
          Stavby
        </th>
        <th className="number-column column-title">Orná pôda &amp; záhrady</th>
        <th className="number-column column-title">Ostatné</th>
      </tr>
    </thead>
    <tbody>
      {politicians.map((politician) => <Politician key={politician.id} politician={politician} />)}
    </tbody>
  </Table>
)

export default PoliticiansList
