// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from './../../../dataProviders/connectionsDataProviders'
import Info from './../../shared/Info/Info'
import type {State} from './../../../state'
import './InfoLoader.css'

export type OwnProps = {
  eid: string,
  hasConnectLine?: boolean,
}
type StateProps = {
  data: any, // TODO: TBD, see status/index.js
}
type Props = OwnProps & StateProps

const InfoLoader = ({data, hasConnectLine}: Props) => (
  <div className="info-loader">
    <Info data={data} />
    {hasConnectLine && (
      <div className="container">
        <div className="info-loader-connection-line" />
      </div>
    )}
  </div>
)

export default compose(
  withDataProviders((props: OwnProps) => [connectionEntityDetailProvider(props.eid)]),
  connect((state: State, props: OwnProps) => ({
    data: state.connections.entityDetails[props.eid].data,
  }))
)(InfoLoader)
