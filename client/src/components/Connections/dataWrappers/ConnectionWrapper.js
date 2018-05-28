import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connectionDetailProvider} from '../../../dataProviders/connectionsDataProviders'

const ConnectionWrapper = (WrappedComponent) => {
  const wrapped = (props) => <WrappedComponent {...props} />

  return compose(
    withDataProviders((props) => [
      connectionDetailProvider(props.entity1.eids.join(), props.entity2.eids.join()),
    ]),
    connect((state, props) => ({
      connections:
        state.connections.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].ids,
    }))
  )(wrapped)
}

export default ConnectionWrapper
