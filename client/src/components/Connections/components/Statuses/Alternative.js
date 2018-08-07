// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import type {State} from '../../../../state'

import {connectionEntityDetailProvider} from '../../../../dataProviders/connectionsDataProviders'

type Props = {
  name: string,
}

const Alternative = ({name}: Props) => <span>{name}</span>

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
  connect((state: State, props) => ({
    name: state.connections.entityDetails[props.eid].name,
  }))
)(Alternative)
