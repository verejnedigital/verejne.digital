// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {State, Company, NewEntityDetail} from '../state'
import {companyDetailProvider, entityDetailProvider} from '../dataProviders/sharedDataProviders'
import {entityDetailSelector, companyDetailSelector} from '../selectors'

type BaseCompanyDetailProps = {
  useNewApi?: boolean,
  eid: number,
}

export type CompanyDetailProps = {
  eid: number,
  useNewApi?: boolean,
  company: NewEntityDetail,
  oldCompany: Company,
}

const CompanyDetailWrapper = (
  WrappedComponent: ComponentType<CompanyDetailProps>
): ComponentType<BaseCompanyDetailProps> => {
  const wrapped = (props: CompanyDetailProps) =>
    (props.useNewApi ? props.company : props.oldCompany) ? <WrappedComponent {...props} /> : null

  return compose(
    withDataProviders(({eid, useNewApi}: BaseCompanyDetailProps) => [
      useNewApi ? entityDetailProvider(eid) : companyDetailProvider(eid),
    ]),
    connect((state: State, props: BaseCompanyDetailProps) => ({
      company: props.useNewApi ? entityDetailSelector(state, props.eid) : null,
      oldCompany: !props.useNewApi ? companyDetailSelector(state, props) : null,
    }))
  )(wrapped)
}

export default CompanyDetailWrapper
