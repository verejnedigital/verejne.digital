// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {companyDetailsProvider} from '../../dataProviders/noticesDataProviders'
import {companyDetailsSelector} from '../../selectors'
import Info from '../shared/Info/Info'

import type {Company, State} from '../../state'

export type CompanyDetailsProps = {
  company: Company,
  eid: string,
}

const CompanyDetails = ({company}: CompanyDetailsProps) => {
  return <Info data={company} eid={company.eid} />
}

export default compose(
  withDataProviders((props: CompanyDetailsProps) => {
    return [companyDetailsProvider(props.eid)]
  }),
  connect((state: State, props: CompanyDetailsProps) => ({
    company: companyDetailsSelector(state, props),
  }))
)(CompanyDetails)
