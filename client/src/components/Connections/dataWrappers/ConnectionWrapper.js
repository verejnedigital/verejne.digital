// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import type {ComponentType} from 'react'
import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'
import {receiveData} from './../../../actions/sharedActions'

const EmptyEidsWrapper = (WrappedComponent: ComponentType<*>) => {
  return (props) => {
    const eid1 = props.entity1.eids.join()
    const eid2 = props.entity2.eids.join()
    // dispatch empty connection ids list
    props.dispatch(receiveData(['connections', 'detail'], {id: `${eid1}-${eid2}`, ids: []}, `connection-${eid1}-${eid2}`))
    return <WrappedComponent {...props} />
  }
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => (isNil(props.connections) ? null : <WrappedComponent {...props} />)

  return compose(
    branch(
      ({entity1, entity2}) => entity1.eids.length && entity2.eids.length,
      withDataProviders((props) => [
        connectionDetailProvider(props.entity1.eids.join(), props.entity2.eids.join()),
      ]),
      EmptyEidsWrapper
    ),
    connect((state, props) => ({
      connections:
        state.connections.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].ids,
    }))
  )(wrapped)
}

export default ConnectionWrapper
