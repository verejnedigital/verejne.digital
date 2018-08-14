// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import type {EntitySearchProps} from './EntitySearchWrapper'
import type {State, SearchedEntity} from '../../../state'
import {connectionEntityProvider} from '../../../dataProviders/connectionsDataProviders'

export type EntityProps = {
  entity1: SearchedEntity,
  entity2: SearchedEntity,
}

const EntityWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: EntityProps) =>
    props.entity1 && props.entity2 ? <WrappedComponent {...props} /> : null

  return compose(
    withDataProviders(({entitySearch1, entitySearch2}: EntitySearchProps) => [
      connectionEntityProvider(entitySearch1),
      connectionEntityProvider(entitySearch2),
    ]),
    connect((state: State, props: EntitySearchProps) => ({
      entity1: state.connections.entities[props.entitySearch1],
      entity2: state.connections.entities[props.entitySearch2],
    }))
  )(wrapped)
}

export default EntityWrapper
