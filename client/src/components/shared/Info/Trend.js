import React from 'react'
import './Trend.css'

export default ({trend}) => {
  let colorStyle
  let text
  if (trend > 0) {
    colorStyle = 'profit'
    text = `+${trend}%`
  } else {
    colorStyle = 'deficit'
    text = `${trend}%`
  }
  return (
    <span>
      &nbsp;(
      <span title="Oproti predchádzajúcemu roku" className={colorStyle}>
        {text}
      </span>
      )
    </span>
  )
}
