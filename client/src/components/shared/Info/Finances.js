// @flow
import React, {Fragment} from 'react'

import type {EnhancedCompanyFinancial} from '../../../services/utilities'
import {icoUrl, ShowNumberCurrency} from '../../../services/utilities'
import Item from './Item'
import Trend from './Trend'

const Finances = ({data, ico}: {data: EnhancedCompanyFinancial, ico: string}) => {  
  const {employees, profit, profitTrend, revenue, revenueTrend, year} = data

  return (
    <Fragment>     
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
    </Fragment>
  )
}

export default Finances
