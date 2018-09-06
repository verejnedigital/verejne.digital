// @flow
import React, {Fragment} from 'react'
import './LegendSymbols.css'
import {getWarning} from './utilities'
import {formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import {Link} from 'react-router-dom'
import {compose, withState, withHandlers} from 'recompose'

import type {Notice} from '../../state'

import './NoticeItem.css'

type Props = {|
  item: Notice,
  showSupplierInfo: boolean,
  showCustomerInfo: boolean,
  toggleSupplier: () => void,
  toggleCustomer: () => void,
|}
const _NoticeItem = ({
  item,
  showSupplierInfo,
  showCustomerInfo,
  toggleSupplier,
  toggleCustomer,
}: Props) => {
  const similarity = Math.round(item.best_similarity * 100)
  return (
    <Fragment>
      <tr className="notice-item">
        <td className="notice-item-title">
          <Link
            title={item.title}
            className="nowrap-ellipsis"
            to={`/obstaravania/${item.notice_id}`}
          >
            {getWarning(item)} {item.title}
          </Link>
        </td>
        <td>
          <a className="notice-item-link" onClick={toggleCustomer}>
            {showCustomerInfo ? <span>[&minus;]</span> : '[+]'} {item.name}
          </a>
        </td>
        <td>
          <a className="notice-item-link" onClick={toggleSupplier}>
            {showSupplierInfo ? <span>[&minus;]</span> : '[+]'}{' '}
            {item.supplier_name || item.best_supplier_name}
          </a>
        </td>
        <td className="text-right">{similarity ? formatSimilarPercent(similarity) : 'ukončené'}</td>
      </tr>
      {showSupplierInfo && (
        <tr>
          <td colSpan={5}>
            <CompanyDetails eid={item.supplier_eid || item.best_supplier} useNewApi />
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
}

export default compose(
  withState('showSupplierInfo', 'toggleSupplier', false),
  withState('showCustomerInfo', 'toggleCustomer', false),
  withHandlers({
    toggleSupplier: ({toggleSupplier}) => () => toggleSupplier((current) => !current),
    toggleCustomer: ({toggleCustomer}) => () => toggleCustomer((current) => !current),
  })
)(_NoticeItem)
