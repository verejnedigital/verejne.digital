// @flow
import React from 'react'
import Info from '../shared/Info/Info'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'

const CompanyDetails = ({company}: CompanyDetailProps) => {
  return <Info data={company} eid={company.eid} />
}

export default CompanyDetailWrapper(CompanyDetails)
