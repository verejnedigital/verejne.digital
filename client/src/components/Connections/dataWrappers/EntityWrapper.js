// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'

import withEntitySearch from './EntitySearchWrapper'
import {connectionEntityProvider} from '../../../dataProviders/connectionsDataProviders'

const EntityWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => (
    <WrappedComponent {...props} entity1={props.entity1} entity2={props.entity2} />
  )

  return compose(
    withEntitySearch,
    withDataProviders(
      ({entitySearch1, entitySearch2}) =>
        entitySearch1 && entitySearch2
          ? [connectionEntityProvider(entitySearch1), connectionEntityProvider(entitySearch2)]
          : []
    ),
    connect((state, props) => ({
      entity1: state.connections.entities[props.entitySearch1],
      entity2: state.connections.entities[props.entitySearch2],
    }))
  )(wrapped)
}

export default EntityWrapper
