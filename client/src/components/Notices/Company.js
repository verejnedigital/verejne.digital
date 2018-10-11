// @flow
import React, {Fragment} from 'react'
import {Link} from 'react-router-dom'
import {compose, withState, withHandlers} from 'recompose'
import {formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import {localeNumber} from '../../services/utilities'

import type {Candidate} from '../../state'

import './Company.css'

type Props = {|
  item: Candidate,
  similarity: number,
  showSupplierInfo: boolean,
  showCustomerInfo: boolean,
  toggleSupplier: () => void,
  toggleCustomer: () => void,
|}

const _Company = ({
  item,
  similarity,
  showSupplierInfo,
  showCustomerInfo,
  toggleSupplier,
  toggleCustomer,
}: Props) => (
  <Fragment>
    <tr className="company">
      <td className="text-nowrap">
        <span className="company-link" onClick={toggleSupplier}>
          {showSupplierInfo ? <Fragment>[&minus;]</Fragment> : '[+]'} {item.supplier_name}
        </span>
      </td>
      <td className="company-title">
        <Link className="nowrap-ellipsis" to={`/obstaravania/${item.notice_id}`} title={item.title}>
          {item.title}
        </Link>
      </td>
      <td>
        <span className="company-link" onClick={toggleCustomer}>
          {showCustomerInfo ? <Fragment>[&minus;]</Fragment> : '[+]'} {item.name}
        </span>
      </td>
      <td className="text-nowrap text-right">
        <strong>{localeNumber(item.total_final_value_amount)}</strong>
      </td>
      <td className="text-center">
        <span className="similarity">{formatSimilarPercent(Math.round(similarity * 100))}</span>
      </td>
    </tr>
    {showSupplierInfo && (
      <tr>
        <td colSpan={5}>
          <CompanyDetails eid={item.supplier_eid} useNewApi />
        </td>
      </tr>
    )}
    {showCustomerInfo && (
      <tr>
        <td colSpan={5}>
          <CompanyDetails eid={item.eid} useNewApi />
        </td>
      </tr>
    )}
  </Fragment>
)

export default compose(
  withState('showSupplierInfo', 'setSupplier', false),
  withState('showCustomerInfo', 'setCustomer', false),
  withHandlers({
    toggleSupplier: ({setSupplier}) => () => setSupplier((current) => !current),
    toggleCustomer: ({setCustomer}) => () => setCustomer((current) => !current),
  })
)(_Company)
