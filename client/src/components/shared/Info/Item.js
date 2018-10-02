// @flow
import React from 'react'
import type {Node} from 'react'

import ExternalLink from '../ExternalLink'
import './Item.css'

type ItemProps = {|
  children?: Node,
  label?: string,
  url?: string,
  linkText?: Node,
|}

const Item = ({children, label, url, linkText}: ItemProps) => (
  <li className="info-item">
    {label && <strong className="info-item-label">{label}</strong>}
    {url && (
      <ExternalLink isMapView={false} url={url}>
        {linkText}
      </ExternalLink>
    )}
    {children}
  </li>
)

export default Item
