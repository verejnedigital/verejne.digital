// @flow
import React from 'react'
import {FaDotCircle} from 'react-icons/fa'
import classnames from 'classnames'
import {getCircleIconTitle} from './utilities'

import './CircleIcon.css'

export type Ties = {
  trade_with_government: boolean,
  contact_with_politics: boolean,
  political_entity: boolean,
}
type OwnProps = {
  data: Ties,
  className?: string,
  size?: string,
}

const CircleIcon = ({data, className, size = '16'}: OwnProps) => (
  <span
    className={classnames(className, 'circle-icon', {
      government: data.trade_with_government,
      politics: data.contact_with_politics,
      politician: data.political_entity,
    })}
    title={getCircleIconTitle(data)}
  >
    <FaDotCircle size={size} />
  </span>
)

export default CircleIcon
