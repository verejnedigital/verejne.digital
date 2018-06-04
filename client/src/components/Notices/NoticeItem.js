import React from 'react'
import './LegendSymbols.css'
import {getWarning, getTitle} from './utilities'
import {formatSimilarCount, formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import {Link} from 'react-router-dom'
import {compose, withState, withHandlers} from 'recompose'
import './NoticeItem.css'

const _NoticeItem = (({item, toggledOn, toggle}) => {
  const similarity = item.kandidati.length > 0 ? Math.round(item.kandidati[0].score * 100) : '?'
  const similarCount = item.kandidati.length > 20 ? '20+' : item.kandidati.length
  return (
    <tr title={getTitle(item)}>
      <td className="text-right">
        <span className="similar-count">{formatSimilarCount(similarCount)}</span>
      </td>
      <td>
        <Link to={`/obstaravania/${item.id}`}>{item.title}</Link> {getWarning(item)}
      </td>
      <td>{item.customer}</td>
      <td>
        {toggledOn && item.kandidati[0].eid ? (
          [
            <a key="close" className="company-link" onClick={toggle}>
              [-]
            </a>,
            <CompanyDetails key="company" eid={item.kandidati[0].eid} />,
          ]
        ) : (
          <a className="company-link" onClick={toggle}>
            {item.kandidati[0].name ? item.kandidati[0].name : '?'}
          </a>
        )}
      </td>
      <td className="text-center">
        {formatSimilarPercent(similarity)}
      </td>
    </tr>
  )
})

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_NoticeItem)
