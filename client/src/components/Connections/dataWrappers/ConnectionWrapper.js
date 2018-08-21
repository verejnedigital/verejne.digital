// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'
import type {ComponentType} from 'react'
import type {EntityProps} from './EntityWrapper'
import type {State} from '../../../state'

export type ConnectionProps = {
  connections: Array<number>,
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: ConnectionProps) =>
    isNil(props.connections) ? null : <WrappedComponent {...props} />

  return branch(
    ({entity1, entity2}: EntityProps) => entity1.eids.length > 0 && entity2.eids.length > 0,
    compose(
      withDataProviders((props: EntityProps) => [
        connectionDetailProvider(props.entity1.eids, props.entity2.eids),
      ]),
      connect((state: State, props: EntityProps) => ({
        connections:
          state.connections.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].ids,
      }))
    )
  )(wrapped)
}

export default ConnectionWrapper
