// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {EntitySearchProps} from './EntitySearchWrapper'
import type {State, SearchedEntity} from '../../../state'
import {entitySearchProvider} from '../../../dataProviders/sharedDataProviders'
import {entitySearchSelector} from '../../../selectors'

export type EntityProps = {
  entity1: SearchedEntity,
  entity2: SearchedEntity,
}

const EntityWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: EntityProps) =>
    props.entity1 && props.entity2 ? <WrappedComponent {...props} /> : null

  return compose(
    withDataProviders(({entitySearch1, entitySearch2}: EntitySearchProps) => [
      entitySearchProvider(entitySearch1),
      entitySearchProvider(entitySearch2),
    ]),
    connect((state: State, props: EntitySearchProps) => ({
      entity1: entitySearchSelector(state, props.entitySearch1),
      entity2: entitySearchSelector(state, props.entitySearch2),
    }))
  )(wrapped)
}

export default EntityWrapper
