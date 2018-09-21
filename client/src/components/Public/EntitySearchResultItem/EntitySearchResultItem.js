// @flow
import React from 'react'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'
import type {NewEntityDetail} from '../../../state'

type EntitySearchResultItemProps = {|
  entity: NewEntityDetail,
|}

const EntitySearchResultItem = ({entity}: EntitySearchResultItemProps) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={entity} inModal />
  </div>
)

export default EntitySearchResultItem
