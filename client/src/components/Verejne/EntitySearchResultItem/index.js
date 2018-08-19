// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import CompanyDetailWrapper from '../../../dataWrappers/CompanyDetailWrapper'
import {toggleModalOpen, zoomToLocation} from '../../../actions/verejneActions'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'

import type {CompanyDetailProps} from '../../../dataWrappers/CompanyDetailWrapper'

type Props = {
  showOnMap: Function,
} & CompanyDetailProps

const EntitySearchResultItem = ({company, showOnMap}: Props) => (
  <div style={{marginBottom: '1rem'}}>
    <Info data={company} eid={company.eid} />
  </div>
)

// NOTE (Emo): Ideally we should download all the entries at once and this should
// be strictly presentional component
export default compose(CompanyDetailWrapper, connect(null, {zoomToLocation, toggleModalOpen}))(
  EntitySearchResultItem
)
