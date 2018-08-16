// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {State, Company} from '../state'
import {entityDetailProvider} from '../dataProviders/publiclyDataProviders'
import {companyDetailProvider} from '../dataProviders/sharedDataProviders'
import {entityDetailSelector, companyDetailSelector} from '../selectors'

export type CompanyDetailProps = {
  useNewApi: boolean,
  eid: string,
  company: Company,
}

const CompanyDetialsWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => (props.company ? <WrappedComponent {...props} /> : null)

  return compose(
    withDataProviders(({eid, useNewApi}) => [
      useNewApi ? entityDetailProvider(eid) : companyDetailProvider(eid),
    ]),
    connect((state: State, props: CompanyDetailProps) => ({
      company: props.useNewApi
        ? entityDetailSelector(state, props.eid)
        : companyDetailSelector(state, props),
    }))
  )(wrapped)
}

export default CompanyDetialsWrapper
