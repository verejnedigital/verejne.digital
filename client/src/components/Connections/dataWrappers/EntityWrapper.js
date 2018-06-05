// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {ComponentType} from 'react'

import {connectionEntityProvider} from '../../../dataProviders/connectionsDataProviders'

const EntityWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) =>
    props.entity1 && props.entity2 ? <WrappedComponent {...props} /> : null

  return compose(    
    withDataProviders(({entitySearch1, entitySearch2}) => [
      connectionEntityProvider(entitySearch1),
      connectionEntityProvider(entitySearch2),
    ]),
    connect((state, props) => ({
      entity1: state.connections.entities[props.entitySearch1],
      entity2: state.connections.entities[props.entitySearch2],
    }))
  )(wrapped)
}

export default EntityWrapper
