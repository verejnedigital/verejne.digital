import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Badge, Button} from 'reactstrap'

import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../../services/utilities'
import '../Info/InfoButton.css'

const EuroFunds = ({data, toggledOn, toggle}) => (
  <div className="eurofunds info-button">
    <Button outline color="primary" onClick={toggle}>
      {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      &nbsp;Eurofondy:&nbsp;<ShowNumberCurrency num={data.eufunds_price_sum} />&nbsp;
      <Badge color="primary">{data.eufunds_count}</Badge>
    </Button>
    {toggledOn && (
      <ul className="list-unstyled info-button-list">
        {data.largest.map((eufund, i) => (
          // no proper ID available
          <li key={i}>
            <ExternalLink url={eufund.link}>
              {`${eufund.title}, `}
              <ShowNumberCurrency num={eufund.price} />
            </ExternalLink>
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => () => toggle((current) => !current),
  })
)(EuroFunds)
