// @flow
import React from 'react'
import {connect} from 'react-redux'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'
import {entityDetailSelector} from '../../../selectors/index'

import type {State, NewEntityDetail} from '../../../state'

type EntitySearchResultItemProps = {
  entity: NewEntityDetail,
}

const EntitySearchResultItem = ({entity}: EntitySearchResultItemProps) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={entity} inModal />
  </div>
)

export default connect((state: State, {eid}) => ({
  entity: entityDetailSelector(state, eid),
}))(EntitySearchResultItem)
