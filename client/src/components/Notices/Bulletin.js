import React from 'react'
import './Legend.css'
import './LegendSymbols.css'
import {Row, Col} from 'reactstrap'
import ExternalLink from '../shared/ExternalLink'

const Bulletin = ({items, number, year, date}) => [
  <Row key="title">
    <Col className="noticeInfo text-center">
      <span>
        <strong>{date}</strong> Vestník číslo{' '}
        <ExternalLink url={`https://www.uvo.gov.sk/evestnik?poradie=${number}&year=${year}`}>
          <strong>
            {number}/{year}
          </strong>
        </ExternalLink>
      </span>
    </Col>
  </Row>,
  <table key="notices-list" className="table table-striped table-responsive">
    <thead>
      <tr>
        <td />
        <td>Názov obstarávania</td>
        <td>Objednávateľ</td>
        <td>Kto by sa mal prihlásiť</td>
        <td>Pod.</td>
      </tr>
    </thead>
    <tbody>{items}</tbody>
  </table>,
]

export default Bulletin
