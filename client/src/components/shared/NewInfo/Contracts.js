import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Badge, Button} from 'reactstrap'

import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency, showContractStatus} from '../../../services/utilities'
import '../Info/InfoButton.css'

const Contracts = ({data, toggledOn, toggle}) => {
  return (
    <div className="contracts info-button">
      <Button outline color="primary" onClick={toggle}>
        {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
        &nbsp;Zmluvy:&nbsp;<ShowNumberCurrency num={data.price_amount_sum} />&nbsp;
        <Badge color="primary">{data.count}</Badge>
      </Button>
      {toggledOn && (
        <ul className="list-unstyled info-button-list">
          {data.most_recent.map((contract, i) => (
            <li key={i}>
              <ExternalLink url={`https://www.crz.gov.sk/index.php?ID=${contract.contract_id}`}>
                {`${contract.client_name}, `}
                <ShowNumberCurrency num={contract.contract_price_total_amount} />
              </ExternalLink>
              &nbsp;({showContractStatus(contract.status_id)})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(Contracts)
