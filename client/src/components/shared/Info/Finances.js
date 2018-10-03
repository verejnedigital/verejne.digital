// @flow
import React, {Fragment} from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'

import type {StateUpdater} from '../../../types/commonTypes'
import type {EnhancedCompanyFinancial} from '../../../services/utilities'
import FinancesItem from './FinancesItem'
import './Finances.css'
import './InfoButton.css'

type FinancesProps = {|
  data: EnhancedCompanyFinancial[],
  ico: string,
  expanded: boolean,
  toggle: () => void,
|}

type StateProps = {
  expanded: boolean,
  setExpanded: StateUpdater<boolean>,
}

const Finances = ({
  data: [lastFinances = {}, ...otherFinances],
  ico,
  expanded,
  toggle,
}: FinancesProps) => (
  <Fragment>
    <FinancesItem data={lastFinances} ico />
    {!!otherFinances.length && (
      <div className="info-button">
        <Button outline color="primary" onClick={toggle}>
          {expanded ? (
            <ChevronUp aria-hidden="true" className="mb-1" />
          ) : (
            <ChevronDown aria-hidden="true" className="mb-1" />
          )}{' '}
          Staršie záznamy{' '}
          <Badge color="primary" className="info-badge info-badge-number">
            {otherFinances.length}
          </Badge>
        </Button>
        <div className="older-finances">
          {expanded &&
            otherFinances.map((finances) => (
              <FinancesItem key={finances.year} data={finances} ico />
            ))}
        </div>
      </div>
    )}
  </Fragment>
)

export default compose(
  withState('expanded', 'setExpanded', false),
  withHandlers({
    toggle: ({setExpanded}: StateProps) => () => setExpanded((current) => !current),
  })
)(Finances)
