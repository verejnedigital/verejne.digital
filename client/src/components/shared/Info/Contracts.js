// @flow
import React from 'react'

import InfoButton from './InfoButton'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency, showContractStatus} from '../../../services/utilities'
import type {Contracts as ContractsType, Contract} from '../../../state'

type ContractsProps = {|
  data: ContractsType,
|}

const buildContract = (contract: Contract) => (
  <li key={contract.id}>
    <ExternalLink url={`https://www.crz.gov.sk/index.php?ID=${contract.contract_id}`}>
      {`${contract.client_name}, `}
      <ShowNumberCurrency num={contract.contract_price_total_amount} />
    </ExternalLink>
    &nbsp;({showContractStatus(contract.status_id)})
  </li>
)

const Contracts = ({data}: ContractsProps) => (
  <InfoButton
    label="Zmluvy"
    count={data.count}
    priceSum={data.price_amount_sum}
    list={data.most_recent}
    buildItem={buildContract}
  />
)

export default Contracts
