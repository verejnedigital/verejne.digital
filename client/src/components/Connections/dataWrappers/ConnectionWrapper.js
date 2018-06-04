// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'
import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => <WrappedComponent {...props} />

  return compose(
    withDataProviders(
      (props) =>
        props.entity1 && props.entity2
          ? [connectionDetailProvider(props.entity1.eids.join(), props.entity2.eids.join())]
          : []
    ),
    connect((state, props) => ({
      connections:
        props.entity1 && props.entity2
          ? state.connections.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`]
            .ids
          : [],
    }))
  )(wrapped)
}

export default ConnectionWrapper
