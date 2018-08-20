import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Badge, Button} from 'reactstrap'

import {ShowNumberCurrency} from '../../../services/utilities'
import './InfoButton.css'

const InfoButton = ({label, count, priceSum, list, buildItem, toggledOn, toggle}) => (
  <div className="contracts info-button">
    <Button outline color="primary" onClick={toggle}>
      {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      &nbsp;{label}:&nbsp;<ShowNumberCurrency num={priceSum} />&nbsp;
      <Badge color="primary">{count}</Badge>
    </Button>
    {toggledOn && <ul className="list-unstyled info-button-list">{list.map(buildItem)}</ul>}
  </div>
)

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => () => toggle((current) => !current),
  })
)(InfoButton)
