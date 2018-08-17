import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'

import RecursiveInfo from './RecursiveInfo'
import './InfoButton.css'

const _Relations = ({data, toggledOn, toggle, useNewApi}) => {
  return (
    <div className="relations info-button">
      <Button outline color="primary" onClick={toggle}>
        {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />} Vzťahy{' '}
        <Badge color="primary">{data.length}</Badge>
      </Button>
      {toggledOn && (
        <ul className="list-unstyled info-button-list">
          {data.map((related, i) => (
            <li key={i}>
              <RecursiveInfo name={related.name} eid={related.eid} useNewApi={useNewApi} />
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
)(_Relations)
