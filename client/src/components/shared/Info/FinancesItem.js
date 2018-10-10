// @flow
import React from 'react'

import {icoUrl, ShowNumberCurrency} from '../../../services/utilities'
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

export default FinancesItem
