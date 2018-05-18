// @flow
import React from 'react'
import classnames from 'classnames'
import './Marker.css'

import type {Node} from 'react'

type Props = {
  title?: string,
  className?: string,
  children?: Node,
  onClick?: () => void,
}

const Marker = ({className, title, children, onClick}: Props) => (
  <div className={classnames('Marker', className)} title={title} onClick={onClick}>
    {children}
  </div>
)

export default Marker
