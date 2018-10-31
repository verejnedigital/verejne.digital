// @flow
import React from 'react'
import {isNumber} from 'lodash'

import {
  icoUrl,
  ShowNumberCurrency,
  type EnhancedCompanyFinancial,
} from '../../../services/utilities'
import Item from './Item'
import Trend from './Trend'
import './FinancesItem.css'

type FinancesItemProps = {|
  data: EnhancedCompanyFinancial,
  ico: string,
|}

const FinancesItem = ({
  data: {employees, profit, profitTrend, revenue, revenueTrend, year},
  ico,
}: FinancesItemProps) => (
  <div className="finances-item">
    {employees && <Item label={`Zamestnanci v ${year}`}>{employees}</Item>}
    {isNumber(profit) && (
      <Item
        label={`Zisk v ${year}`}
        url={icoUrl(ico)}
        linkText={<ShowNumberCurrency num={profit} />}
      >
        <Trend trend={profitTrend} />
      </Item>
    )}
    {isNumber(revenue) && (
      <Item
        label={`Tržby v ${year}`}
        url={icoUrl(ico)}
        linkText={<ShowNumberCurrency num={revenue} />}
      >
        <Trend trend={revenueTrend} />
      </Item>
    )}
  </div>
)

export default FinancesItem
