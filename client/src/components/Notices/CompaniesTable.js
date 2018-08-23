import React from 'react'
import {compose, branch, renderNothing} from 'recompose'
import {Table} from 'reactstrap'
import Company from './Company'

import type {Notice} from '../../state'

import './CompaniesTable.css'

type Props = {|
  item: Notice,
|}

const _CompaniesTable = ({item}: Props) => {
  if (item === null) {
    return null
  }
  return (
    <Table key="companies" responsive className="companies-table" borderless>
      <thead className="companies-table-header">
        <tr>
          <th>Kto by sa mal prihlásiť</th>
          <th>Čo podobné vyhral</th>
          <th>Objednávateľ</th>
          <th className="text-right">Cena €</th>
          <th title="Podobnosť">Pod.</th>
        </tr>
      </thead>
      <tbody>
        {item.kandidati.length > 0 ? (
          item.kandidati.map((item) => <Company key={item.id} item={item} />)
        ) : (
          <tr>
            <td colSpan={5} className="text-center">
              Nenašli sa vyhovujúci kandidáti.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}

export default compose(branch((props) => props.item === null, renderNothing))(_CompaniesTable)
