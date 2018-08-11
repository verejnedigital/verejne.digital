// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'
import Info from '../../../../../shared/Info/Info'
import './InfoLoader.css'

const InfoLoader = ({data, hasConnectLine, recursive}) => (
  <div className="info-loader">
    <Info data={data} />
    {hasConnectLine && <div className="container"><div className="info-loader-connection-line" /></div>}
  </div>
)

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    data: state.connections.entityDetails[props.eid].data,
  }))
)(InfoLoader)
