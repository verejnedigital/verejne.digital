// @flow
import React from 'react'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'
import Info from '../shared/Info/Info'

const CompanyDetails = ({company, onClose}: CompanyDetailProps) =>
  <Info data={company} onClose={onClose} />

export default CompanyDetailWrapper(CompanyDetails)
