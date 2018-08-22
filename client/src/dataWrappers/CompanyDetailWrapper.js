// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {State, Company, NewEntityDetail} from '../state'
import {companyDetailProvider, entityDetailProvider} from '../dataProviders/sharedDataProviders'
import {entityDetailSelector, companyDetailSelector} from '../selectors'

export type CompanyDetailProps = {
  useNewApi: boolean,
  eid: number,
  company: NewEntityDetail,
  oldCompany: Company,
}

const CompanyDetailWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: CompanyDetailProps) =>
    (props.useNewApi ? props.company : props.oldCompany) ? <WrappedComponent {...props} /> : null

  return compose(
    withDataProviders(({eid, useNewApi}: CompanyDetailProps) => [
      useNewApi ? entityDetailProvider(eid) : companyDetailProvider(eid),
    ]),
    connect((state: State, props: CompanyDetailProps) => ({
      company: props.useNewApi ? entityDetailSelector(state, props.eid) : null,
      oldCompany: !props.useNewApi ? companyDetailSelector(state, props) : null,
    }))
  )(wrapped)
}

export default CompanyDetailWrapper
