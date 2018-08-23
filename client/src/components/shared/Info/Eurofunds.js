// @flow
import React from 'react'

import InfoButton from './InfoButton'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../../services/utilities'
import type {Eufunds, Eufund} from '../../../state'

type EurofundsProps = {|
  data: Eufunds,
|}

const Eurofunds = ({data}: EurofundsProps) => (
  <InfoButton
    label="Eurofondy"
    count={data.eufunds_count}
    priceSum={data.eufunds_price_sum}
    list={data.largest}
    buildItem={(eufund: Eufund, i: number) => (
      // no proper ID available
      <li key={i}>
        <ExternalLink url={eufund.link}>
          {`${eufund.title}, `}
          <ShowNumberCurrency num={eufund.price} />
        </ExternalLink>
      </li>
    )}
  />
)

export default Eurofunds
