// @flow
import React from 'react'
import './Legend.css'
import './LegendSymbols.css'
import NoticeItem from './NoticeItem'
import {Table} from 'reactstrap'
import ExternalLink from '../shared/ExternalLink'

import type {Notice} from '../../state'

import './Bulletin.css'

type Props = {|
  items: Array<Notice>,
  number: number,
  year: number,
  date: string,
|}

const Bulletin = ({items, number, year, date}: Props) => (
  <div className="bulletin">
    <h3 className="bulletin-title">
      <strong>{date}</strong>
      <small>
        <span>Vestník číslo </span>
        <ExternalLink url={`https://www.uvo.gov.sk/evestnik?poradie=${number}&year=${year}`}>
          {number}/{year}
        </ExternalLink>
      </small>
    </h3>
    <Table responsive className="bulletin-table">
      <thead>
        <tr>
          <th>Názov obstarávania</th>
          <th>Objednávateľ</th>
          <th>Kto by sa mal prihlásiť/výherca</th>
          <th className="text-right">Pod.</th>
        </tr>
      </thead>
      <tbody>{items.map((item) => <NoticeItem key={item.notice_id} item={item} />)}</tbody>
    </Table>
  </div>
)

export default Bulletin
