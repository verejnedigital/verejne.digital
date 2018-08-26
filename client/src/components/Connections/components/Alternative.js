// @flow
import React from 'react'
import CompanyDetailWrapper from './../../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../../dataWrappers/CompanyDetailWrapper'

type Props = CompanyDetailProps

const Alternative = ({company}: Props) => <span>{company.name}</span>

export default CompanyDetailWrapper(Alternative)
