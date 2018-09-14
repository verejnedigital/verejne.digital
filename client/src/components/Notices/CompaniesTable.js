// @flow
import React from 'react'
import {compose, branch, renderNothing} from 'recompose'
import {Table} from 'reactstrap'
import Company from './Company'

import type {NoticeDetail} from '../../state'

import './CompaniesTable.css'

type Props = {|
  item: NoticeDetail,
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
          <th title="Podobnosť" className="text-center">
            Pod.
          </th>
        </tr>
      </thead>
      <tbody>
        {item.candidates_extra && item.candidates_extra.length > 0 ? (
          item.candidates_extra.map((candidate, i) => (
            <Company key={candidate.notice_id} item={candidate} similarity={item.similarities[i]} />
          ))
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
