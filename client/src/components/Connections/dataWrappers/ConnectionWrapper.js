// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'
import {receiveData} from './../../../actions/sharedActions'
import type {ComponentType} from 'react'
import type {EntityProps} from './EntityWrapper'
import type {State} from '../../../state'
import type {Dispatch} from '../../../types/reduxTypes'

export type DispatchProps = {
  // TODO dispatch should be in all the props, create Props base?
  dispatch: Dispatch,
}
export type ConnectionProps = {
  connections: Array<string>,
}

const EmptyEidsWrapper = (WrappedComponent: ComponentType<*>) => {
  return (props: DispatchProps & EntityProps) => {
    const eid1 = props.entity1.eids.join()
    const eid2 = props.entity2.eids.join()
    // dispatch empty connection ids list
    props.dispatch(
      receiveData(
        ['connections', 'detail'],
        {id: `${eid1}-${eid2}`, ids: []},
        `connection-${eid1}-${eid2}`
      )
    )
    return <WrappedComponent {...props} />
  }
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: ConnectionProps) =>
    isNil(props.connections) ? null : <WrappedComponent {...props} />

  return compose(
    branch(
      ({entity1, entity2}: EntityProps) => entity1.eids.length > 0 && entity2.eids.length > 0,
      withDataProviders((props: EntityProps) => [
        connectionDetailProvider(props.entity1.eids.join(), props.entity2.eids.join()),
      ]),
      EmptyEidsWrapper
    ),
    connect((state: State, props: EntityProps) => ({
      connections:
        state.connections.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].ids,
    }))
  )(wrapped)
}

export default ConnectionWrapper
