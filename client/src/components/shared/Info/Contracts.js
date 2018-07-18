import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Badge, Button} from 'reactstrap'

import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../Notices/utilities'
import './Contracts.css'

const _Contracts = ({data, toggledOn, toggle}) => {
  return (
    <div className="contracts">
      <Button outline color="primary" onClick={toggle}>
        {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />} Zmluvy{' '}
        <Badge color="primary">{data.length}</Badge>
      </Button>
      {toggledOn && (
        <ul className="list-unstyled contracts-list">
          {data.map((contract, i) => (
            <li key={contract.eid}>
              <ExternalLink url={contract.source}>
                {`${contract.customer}, `}
                <ShowNumberCurrency num={contract.total} />
              </ExternalLink>
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
)(_Contracts)
