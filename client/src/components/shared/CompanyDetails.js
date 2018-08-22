// @flow
import React from 'react'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'
import OldInfo from '../shared/Info/OldInfo'
import Info from '../shared/Info/Info'

const CompanyDetails = ({company, oldCompany, useNewApi}: CompanyDetailProps) =>
  useNewApi ? (
    <Info data={company} eid={company.eid} />
  ) : (
    <OldInfo data={oldCompany} eid={oldCompany.eid} />
  )

export default CompanyDetailWrapper(CompanyDetails)
