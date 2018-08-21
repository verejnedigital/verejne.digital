// @flow
import React from 'react'
import CompanyDetailWrapper from '../../../dataWrappers/CompanyDetailWrapper'
import './EntitySearchResultItem.css'
import OldInfo from '../../shared/Info/OldInfo'

import type {CompanyDetailProps} from '../../../dataWrappers/CompanyDetailWrapper'

type Props = CompanyDetailProps

const EntitySearchResultItem = ({oldCompany}: Props) => (
  <div style={{marginBottom: '1rem'}}>
    <OldInfo data={oldCompany} eid={oldCompany.eid} inModal />
  </div>
)

// NOTE (Emo): Ideally we should download all the entries at once and this should
// be strictly presentional component
export default CompanyDetailWrapper(EntitySearchResultItem)
