// @flow
import React from 'react'
import Info from '../shared/Info/Info'
import CompanyDetailWrapper from '../../dataWrappers/CompanyDetailWrapper'
import type {CompanyDetailProps} from '../../dataWrappers/CompanyDetailWrapper'

const CompanyDetails = ({company, useNewApi}: CompanyDetailsProps) => {
  return useNewApi ? (
    <NewInfo data={company} eid={company.eid} />
  ) : (
    <Info data={company} eid={company.eid} />
  )
}

export default CompanyDetailWrapper(CompanyDetails)
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {companyDetailsProvider} from '../../dataProviders/noticesDataProviders'
import {entityDetailProvider} from '../../dataProviders/publiclyDataProviders'
import {companyDetailsSelector, entityDetailSelector} from '../../selectors'
import Info from '../shared/Info/Info'
import NewInfo from '../shared/NewInfo/Info'

import type {Company, State} from '../../state'

export type CompanyDetailsProps = {
  eid: string,
  useNewApi: boolean,
  company: Company,
}

const CompanyDetails = ({company, useNewApi}: CompanyDetailsProps) => {
  return useNewApi ? (
    <NewInfo data={company} eid={company.eid} />
  ) : (
    <Info data={company} eid={company.eid} />
  )
}

export default compose(
  withDataProviders(({eid, useNewApi}: CompanyDetailsProps) => {
    return [useNewApi ? entityDetailProvider(eid) : companyDetailsProvider(eid)]
  }),
  connect((state: State, props: CompanyDetailsProps) => ({
    company: props.useNewApi
      ? entityDetailSelector(state, props.eid)
      : companyDetailsSelector(state, props),
  }))
)(CompanyDetails)
