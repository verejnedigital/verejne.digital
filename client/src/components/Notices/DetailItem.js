import React from 'react'
import {Link} from 'react-router-dom'
import './LegendSymbols.css'
import {addCommas} from './utilities'
import {formatSimilarPercent} from './LegendSymbols'
import NoticeRelated from './NoticeRelated'

const DetailItem = ({item}) => {
  return (
    <tr>
      <td>
        <NoticeRelated recursive eid={item.eid}>{item.name}</NoticeRelated>
      </td>
      <td><Link to={`/detail/${item.id}`}>{item.title}</Link></td>
      <td>{item.customer}</td>
      <td className="text-nowrap text-right"><strong>{addCommas(item.price)}</strong></td>
      <td className="text-center"><span className="similarity">{formatSimilarPercent(Math.round(item.score * 100))}</span></td>
    </tr>
  )
}

export default DetailItem
