// @flow
import React from 'react'
import classnames from 'classnames'
import './Marker.css'

type Props = {
  text: string | number,
  className: string,
}

const Marker = ({text, className}: Props) => (
  <div className={classnames('Marker', className)}>
    <span className="Marker__Text">{text}</span>
  </div>
)

export default Marker
