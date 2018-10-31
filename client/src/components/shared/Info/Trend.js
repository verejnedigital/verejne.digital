// @flow
import React from 'react'
import './Trend.css'

type TrendProps = {|
  trend?: number,
|}

const Trend = ({trend}: TrendProps) =>
  typeof trend === 'number' && (
    <span>
      &nbsp;(
      <span title="Oproti predchádzajúcemu roku" className={trend > 0 ? 'profit' : 'deficit'}>
        {`${trend > 0 ? '+' : ''}${trend}%`}
      </span>
      )
    </span>
  )

export default Trend
