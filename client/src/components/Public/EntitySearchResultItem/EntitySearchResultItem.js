// @flow
import React from 'react'
import {connect} from 'react-redux'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'
import {entityDetailSelector} from '../../../selectors/index'

const EntitySearchResultItem = ({entity}) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={entity} inModal />
  </div>
)

export default connect(
  (state, {eid}) => ({
    entity: entityDetailSelector(state, eid),
  }))(EntitySearchResultItem)
