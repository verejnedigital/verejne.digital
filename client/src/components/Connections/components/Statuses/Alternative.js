import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connectionEntityDetailProvider} from '../../../../dataProviders/connectionsDataProviders'

const Alternative = (props) => <span>{props.name}</span>

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    name: state.connections.entityDetails[props.eid].name,
  }))
)(Alternative)
