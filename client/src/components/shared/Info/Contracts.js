import React from 'react'
import ExternalLink from '../ExternalLink'
import {showNumberCurrency} from '../../Notices/utilities'
import './InfoList.css'

const Contracts = ({data}) => (
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

export default Contracts
