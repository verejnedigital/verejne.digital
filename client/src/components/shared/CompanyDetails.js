// @flow
import React from 'react'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'
import OldInfo from '../shared/Info/OldInfo'
import NewInfo from '../shared/NewInfo/Info'

const CompanyDetails = ({company, useNewApi}: CompanyDetailProps) => {
  return useNewApi ? (
    <NewInfo data={company} eid={company.eid} />
  ) : (
    <OldInfo data={company} eid={company.eid} />
  )
}

export default CompanyDetailWrapper(CompanyDetails)
