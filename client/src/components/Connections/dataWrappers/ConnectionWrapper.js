// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import {connectionDetailSelector} from '../../../selectors'
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

  return compose(
    branch(
      ({entity1, entity2}: EntityProps) => entity1.eids.length > 0 && entity2.eids.length > 0,
      withDataProviders((props: EntityProps) => [
        connectionDetailProvider(props.entity1.eids, props.entity2.eids),
      ]),
    ),
    connect((state: State, props: EntityProps) => ({
      connections: connectionDetailSelector(state, props.entity1.eids, props.entity2.eids),
    }))
  )(wrapped)
}

export default ConnectionWrapper
