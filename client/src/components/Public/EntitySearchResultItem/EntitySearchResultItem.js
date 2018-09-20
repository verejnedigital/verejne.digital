// @flow
import React from 'react'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'
import type {NewEntityDetail} from '../../../state'

type props = {
  data: NewEntityDetail,
}

export default ({data}: props) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={data} inModal />
  </div>
)
