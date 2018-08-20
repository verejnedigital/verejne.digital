import React from 'react'

import InfoButton from './InfoButton'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../../services/utilities'

const EuroFunds = ({data}) => (
  <InfoButton
    label="Eurofondy"
    count={data.eufunds_count}
    priceSum={data.eufunds_price_sum}
    list={data.largest}
    buildItem={(eufund, i) => (
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

export default EuroFunds
