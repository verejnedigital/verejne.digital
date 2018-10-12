// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import {connectionDetailSelector, specificEntitySearchSelector} from '../../../selectors'
import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'
import type {ComponentType} from 'react'
import type {EntityProps} from './EntityWrapper'
import type {State} from '../../../state'

export type ConnectionProps = {
  connections: Array<number>,
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: ConnectionProps & EntityProps) =>
    isNil(props.connections) && props.entity2.query.length > 0 ? null : (
      <WrappedComponent {...props} />
    )

  return compose(
    branch(
      ({entity1, entity2}: EntityProps) =>
        entity1.eids.length > 0 && entity2.query.length > 0 && entity2.eids.length > 0,
      compose(
        connect((state: State, props: EntityProps & ConnectionProps) => ({
          specificEntity1: specificEntitySearchSelector(state, props.entity1.query, 0),
          specificEntity2: specificEntitySearchSelector(state, props.entity2.query, 1),
        })),
        withDataProviders((props: EntityProps) => [
          connectionDetailProvider(props.specificEntity1.eids, props.specificEntity2.eids),
        ])
      )
    ),
    connect((state: State, props: EntityProps) => ({
      connections: connectionDetailSelector(
        state,
        props.specificEntity1.eids,
        props.specificEntity2.eids
      ),
    }))
  )(wrapped)
}

export default ConnectionWrapper
