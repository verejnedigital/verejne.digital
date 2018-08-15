// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {State, Company} from '../state'
import {companyDetailProvider} from '../dataProviders/sharedDataProviders'
import {companyDetailSelector} from '../selectors'

export type CompanyDetailProps = {
  eid: string,
  company: Company,
}

const CompanyDetialsWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => (props.company ? <WrappedComponent {...props} /> : null)

  return compose(
    withDataProviders(({eid}) => [companyDetailProvider(eid)]),
    connect((state: State, props: CompanyDetailProps) => ({
      company: companyDetailSelector(state, props),
    }))
  )(wrapped)
}

export default CompanyDetialsWrapper
