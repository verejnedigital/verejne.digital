import React from 'react'

const ShowTrend = ({isMapView, trend}) => {
  const style = {}
  if (!isMapView) {
    style.color = trend >= 0 ? 'green' : 'red'
  }
  return (
    <span title="Oproti predchádzajúcemu roku" style={style} >
      {`${trend > 0 ? '+' : ''}${trend}%`}
    </span>
  )
}

export default ShowTrend
