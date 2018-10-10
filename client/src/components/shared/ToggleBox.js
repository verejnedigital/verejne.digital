// @flow
import React, {Node} from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'

import type {StateUpdater} from '../../../types/commonTypes'
import './ToggleBox.css'

type ToggleBoxProps = {|
  buttonText: string,
  expanded: boolean,
  children: Node,
  buttonInfo: string,
  toggle: () => void,
|}

type StateProps = {
  expanded: boolean,
  setExpanded: StateUpdater<boolean>,
}

const ToggleBox = ({buttonText, expanded, children, buttonInfo, toggle}: ToggleBoxProps) => (
  <div className="info-button">
    <Button outline color="primary" onClick={toggle}>
      {expanded ? (
        <ChevronUp aria-hidden="true" className="mb-1" />
      ) : (
        <ChevronDown aria-hidden="true" className="mb-1" />
      )}{' '}
      {`${buttonText} `}
      <Badge color="primary" className="info-badge info-badge-number">
        {buttonInfo}
      </Badge>
    </Button>
    <div className="content">
      {expanded && children}
    </div>
  </div>
)

export default compose(
  withState('expanded', 'setExpanded', false),
  withHandlers({
    toggle: ({setExpanded}: StateProps) => () => setExpanded((current) => !current),
  })
)(ToggleBox)
