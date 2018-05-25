import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connexionEntityProvider} from '../../../dataProviders/connexionsDataProviders'

const EntityWrapper = (WrappedComponent) => {
  const wrapped = (props) => (
    <WrappedComponent {...props} entity1={props.entity1} entity2={props.entity2} />
  )

  return compose(
    withDataProviders((props) => [
      connexionEntityProvider(props.entitySearch1),
      connexionEntityProvider(props.entitySearch2),
    ]),
    connect((state, props) => ({
      entity1: state.connexions.entities[props.entitySearch1],
      entity2: state.connexions.entities[props.entitySearch2],
    }))
  )(wrapped)
}

export default EntityWrapper
