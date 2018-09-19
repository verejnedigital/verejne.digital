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
  return (
    <Fragment>
      <tr className="notice-item">
        <td className="notice-item-title">
          {getWarning(item)}
          <Link
            title={item.title}
            className="nowrap-ellipsis"
            to={`/obstaravania/${item.notice_id}`}
          >
            {item.title}
          </Link>
        </td>
        <td>
          <a className="notice-item-link" onClick={toggleCustomer}>
            {showCustomerInfo ? <span>[&minus;]</span> : '[+]'} {item.name}
          </a>
        </td>
        <td>
          {item.best_supplier_name && (
            <a className="notice-item-link" onClick={toggleSupplier}>
              {showSupplierInfo ? <span>[&minus;]</span> : '[+]'} {item.best_supplier_name}
            </a>
          )}
        </td>
        <td>
          {item.supplier_name && (
            <a className="notice-item-link" onClick={toggleSupplier}>
              {showSupplierInfo ? <span>[&minus;]</span> : '[+]'} {item.supplier_name}
            </a>
          )}
        </td>
        <td className="text-right">
          {item.best_similarity ? formatSimilarPercent(Math.round(item.best_similarity * 100)) : ''}
        </td>
      </tr>
      {showSupplierInfo && (
        <tr>
          <td colSpan={5}>
            <CompanyDetails eid={item.supplier_eid || item.best_supplier} />
          </td>
        </tr>
      )}
      {showCustomerInfo && (
        <tr>
          <td colSpan={5}>
            <CompanyDetails eid={item.eid} />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export default compose(
  withState('showSupplierInfo', 'setSupplier', false),
  withState('showCustomerInfo', 'setCustomer', false),
  withHandlers({
    toggleSupplier: ({setSupplier}) => () => setSupplier((current) => !current),
    toggleCustomer: ({setCustomer}) => () => setCustomer((current) => !current),
  })
)(_NoticeItem)
