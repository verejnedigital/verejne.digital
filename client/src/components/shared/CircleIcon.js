// @flow
import React from 'react'
import Circle from 'react-icons/lib/fa/circle-o'
import classnames from 'classnames'

import './CircleIcon.css'

type OwnProps = {
  data: {
    trade_with_government: boolean,
    contact_with_politics: boolean,
    political_entity: boolean,
  },
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
  >
    <Circle size={size} />
  </span>
)

export default CircleIcon
