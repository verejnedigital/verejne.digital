// @flow
import React from 'react'

type Props = {
  numPoints: number,
}

const Marker = ({numPoints}: Props) => (
  <div className="GoogleMap__Marker">
    <span className="GoogleMap__Marker__Text">{numPoints}</span>
  </div>
)

export default Marker
