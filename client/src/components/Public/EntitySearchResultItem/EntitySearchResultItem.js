// @flow
import React from 'react'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'
import type {NewEntityDetail} from '../../../state'

type Props = {|
  entity: NewEntityDetail,
|}

const EntitySearchResultItem = ({entity}: Props) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={entity} inModal />
  </div>
)

export default EntitySearchResultItem
