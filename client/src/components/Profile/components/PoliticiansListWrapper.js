// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import {politiciansProvider} from '../../../dataProviders/profileDataProviders'
import {filteredPoliticiansSelector, politicianGroupSelector} from '../../../selectors/profileSelectors'

import type {State, Politician} from '../../../state'

type BasePoliticiansListProps = {
  politicianGroup: string,
}

export type PoliticiansListProps = {
  politicians: Array<Politician>,
  politicianGroup: string,
}

const PoliticiansListWrapper = (
  WrappedComponent: ComponentType<PoliticiansListProps>
): ComponentType<BasePoliticiansListProps> => {
  const wrapped = (props: PoliticiansListProps) => <WrappedComponent {...props} />

  return compose(
    connect((state: State) => ({
      politicianGroup: politicianGroupSelector(state),
      politicians: filteredPoliticiansSelector(state),
    })),
    withDataProviders(({politicianGroup}: BasePoliticiansListProps) =>
      [politiciansProvider(politicianGroup)]),
  )(wrapped)
}

export default PoliticiansListWrapper
