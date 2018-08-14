// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../dataProviders/connectionsDataProviders'
import type {State} from '../../../state'

type OwnProps = {
  eid: string,
}
type DispatchProps = {
  name: string,
}
type Props = OwnProps & DispatchProps

const Alternative = ({name}: Props) => <span>{name}</span>

export default compose(
  withDataProviders((props: OwnProps) => [connectionEntityDetailProvider(props.eid)]),
  connect((state: State, props: OwnProps) => ({
    name: state.connections.entityDetails[props.eid].name,
  }))
)(Alternative)
