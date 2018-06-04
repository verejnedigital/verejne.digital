import React from 'react'
import {Link} from 'react-router-dom'
import './LegendSymbols.css'
import {formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import './NoticeItem.css'
import {localeNumber} from './utilities'
import {compose, withState, withHandlers} from 'recompose'

const _Company = (({item, toggledOn, toggle}) => {
  return (
    <tr>
      <td>
        {toggledOn && item.eid ? (
          [
            <a key="close" className="company-link" onClick={toggle}>
              [-]
            </a>,
            <CompanyDetails key="company" eid={item.eid} />,
          ]
        ) : (
          <a className="company-link" onClick={toggle}>
            {item.name}
          </a>
        )}
      </td>
      <td>
        <Link to={`/obstaravania/${item.id}`}>{item.title}</Link>
      </td>
      <td>{item.customer}</td>
      <td className="text-nowrap text-right">
        <strong>{localeNumber(item.price)}</strong>
      </td>
      <td className="text-center">
        <span className="similarity">{formatSimilarPercent(Math.round(item.score * 100))}</span>
      </td>
    </tr>
  )
})

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_Company)
