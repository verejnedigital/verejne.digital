// @flow
import React from 'react'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'
import Info from '../shared/Info/Info'

const CompanyDetails = ({company, canClose, onClose}: CompanyDetailProps) =>
  <Info data={company} canClose={canClose} onClose={onClose} />

export default CompanyDetailWrapper(CompanyDetails)
