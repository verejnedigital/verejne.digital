import React from 'react'
import ExternalLink from '../ExternalLink'
import {showNumberCurrency} from '../../Notices/utilities'
import './InfoList.css'

export default ({data}) => (
  <ul className="contractList list-unstyled">
    {data.map((contract) => (
      <li key={contract.source}>
        <ExternalLink
          url={contract.source}
          text={[contract.customer, ', ', showNumberCurrency(contract.total)]}
        />
      </li>
    ))}
  </ul>
)
