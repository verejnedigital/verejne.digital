import React from 'react'

const Marker = ({numPoints}) => (
  <div className="GoogleMap__Marker">
    <span className="GoogleMap__Marker__Text">{numPoints}</span>
  </div>
)

export default Marker
