// @flow
import React, {Fragment} from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'

import type {StateUpdater} from '../../../types/commonTypes'
import type {EnhancedCompanyFinancial} from '../../../services/utilities'
import {icoUrl, ShowNumberCurrency} from '../../../services/utilities'
import Item from './Item'
import Trend from './Trend'
import './Finances.css'
import './InfoButton.css'

type FinancesProps = {|
  data: EnhancedCompanyFinancial[],
  ico: string,
  toggledOn: boolean,
  toggle: () => void,
|}

type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const FinancesItem = ({data, ico}: {data: EnhancedCompanyFinancial, ico: string}) => {  
  const {employees, profit, profitTrend, revenue, revenueTrend, year} = data

  return (
    <div className="finances-item">     
      {employees && (
        <Item label={`Zamestnanci v ${year}`}>{employees}</Item>
      )} 
      {profit && (
        <Item
          label={`Zisk v ${year}`}
          url={icoUrl(ico)}
          linkText={<ShowNumberCurrency num={profit} />}
        >
          {profitTrend && <Trend trend={profitTrend} />}
        </Item>
      )}
      {revenue && (
        <Item
          label={`Tržby v ${year}`}
          url={icoUrl(ico)}
          linkText={<ShowNumberCurrency num={revenue} />}
        >
          {revenueTrend && <Trend trend={revenueTrend} />}
        </Item>
      )}
    </div>
  )
}

const Finances = ({data, ico, toggledOn, toggle}: FinancesProps) => {
  const [lastFinances = {}, ...otherFinances] = data

  return (
    <Fragment>
      <FinancesItem data={lastFinances} ico />
      {otherFinances.length &&
        (
          <div className="info-button">
            <Button outline color="primary" onClick={toggle}>
            {toggledOn ? (
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
              {toggledOn && otherFinances.map(finances => {
                return (<FinancesItem data={finances} ico />)
              })}
            </div>
          </div>
        )
      }
    </Fragment>
  )
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(Finances)
