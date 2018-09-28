// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {State, NewEntityDetail} from '../state'
import {entityDetailProvider} from '../dataProviders/sharedDataProviders'
import {entityDetailSelector} from '../selectors'

type BaseCompanyDetailProps = {
  eid: number,
}

export type CompanyDetailProps = {
  eid: number,
  company: NewEntityDetail,
  onClose?: () => void,
}

const CompanyDetailWrapper = (
  WrappedComponent: ComponentType<CompanyDetailProps>
): ComponentType<BaseCompanyDetailProps> => {
  const wrapped = (props: CompanyDetailProps) => <WrappedComponent {...props} />

  return compose(
    withDataProviders(({eid}: BaseCompanyDetailProps) => [entityDetailProvider(eid)]),
    connect((state: State, props: BaseCompanyDetailProps) => ({
      company: entityDetailSelector(state, props.eid),
    }))
  )(wrapped)
}

export default CompanyDetailWrapper
