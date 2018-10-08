// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import {politiciansProvider} from '../../../dataProviders/profileDataProviders'
import {
  filteredPoliticiansSelector,
  politicianGroupSelector,
} from '../../../selectors/profileSelectors'

import type {ContextRouter} from 'react-router'
import type {State, Politician} from '../../../state'

export type PoliticiansListProps = {
  politicians: Array<Politician>,
  politicianGroup: string,
}

const PoliticiansListWrapper = (WrappedComponent: ComponentType<PoliticiansListProps>) => {
  const wrapped = (props: PoliticiansListProps) => <WrappedComponent {...props} />

  return compose(
    withRouter,
    connect((state: State, props: ContextRouter) => ({
      politicianGroup: politicianGroupSelector(state, props),
      politicians: filteredPoliticiansSelector(state, props),
    })),
    withDataProviders(({politicianGroup}: PoliticiansListProps) => [
      politiciansProvider(politicianGroup),
    ])
  )(wrapped)
}

export default PoliticiansListWrapper
