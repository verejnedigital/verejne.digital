import React, {Fragment} from 'react'
import {Link} from 'react-router-dom'
import {compose, withState, withHandlers} from 'recompose'
import {formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import {localeNumber} from '../../services/utilities'
import './Company.css'

const _Company = ({item, toggledOn, toggle}) => {
  const showCompanyDetails = toggledOn && item.eid
  return (
    <Fragment>
      <tr className="company">
        <td className="text-nowrap">
          <a key="close" className="company-link" onClick={toggle}>
            {showCompanyDetails ? <Fragment>[&minus;]</Fragment> : '[+]'} {item.name}
          </a>
        </td>
        <td className="company-title">
          <Link className="nowrap-ellipsis" to={`/obstaravania/${item.id}`} title={item.title}>
            {item.title}
          </Link>
        </td>
        <td className="company-customer">
          <span className="nowrap-ellipsis" title={item.customer}>
            {item.customer}
          </span>
        </td>
        <td className="text-nowrap text-right">
          <strong>{localeNumber(item.price)}</strong>
        </td>
        <td className="text-center">
          <span className="similarity">{formatSimilarPercent(Math.round(item.score * 100))}</span>
        </td>
      </tr>
      {showCompanyDetails && (
        <tr>
          <td colSpan={5}>
            <CompanyDetails key="company" eid={item.eid} />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_Company)
