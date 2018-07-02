// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'
import Info from '../../../../../shared/Info/Info'
import './InfoLoader.css'

const InfoLoader = ({data, hasConnectLine, recursive}) => (
  <div
    className={
      recursive
        ? 'infoWrapper'
        : 'infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6'
    }
  >
    <Info data={data} />
    {hasConnectLine && <div className="connectLine" />}
  </div>
)

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    data: state.connections.entityDetails[props.eid].data,
  })),
)(InfoLoader)
