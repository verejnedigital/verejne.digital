import React from 'react'

import InfoButton from './InfoButton'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency, showContractStatus} from '../../../services/utilities'

const Contracts = ({data}) => (
  <InfoButton
    label="Zmluvy"
    count={data.count}
    priceSum={data.price_amount_sum}
    list={data.most_recent}
    buildItem={(contract) => (
      <li key={contract.id}>
        <ExternalLink url={`https://www.crz.gov.sk/index.php?ID=${contract.contract_id}`}>
          {`${contract.client_name}, `}
          <ShowNumberCurrency num={contract.contract_price_total_amount} />
        </ExternalLink>
        &nbsp;({showContractStatus(contract.status_id)})
      </li>
    )}
  />
)

export default Contracts
