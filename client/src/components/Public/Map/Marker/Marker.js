// @flow
import React from 'react'
import classnames from 'classnames'
import './Marker.css'

import type {Node} from 'react'

type Props = {
  className?: string,
  children?: Node,
  onClick?: () => void,
}

const Marker = ({className, children, onClick}: Props) => (
  <div className={classnames('marker', className)} onClick={onClick}>
    {children}
  </div>
)

export default Marker
