import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connexionDetailProvider} from '../../../dataProviders/connexionsDataProviders'

const ConnexionWrapper = (WrappedComponent) => {
  const wrapped = (props) => <WrappedComponent {...props} connexions={props.connexions} />

  return compose(
    withDataProviders((props) => [
      connexionDetailProvider(props.entity1.eids.join(), props.entity2.eids.join()),
    ]),
    connect((state, props) => ({
      connexions:
        state.connexions.detail[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].ids,
    }))
  )(wrapped)
}

export default ConnexionWrapper
