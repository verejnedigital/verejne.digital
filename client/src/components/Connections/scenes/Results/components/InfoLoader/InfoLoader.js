import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'
// import Info from '../info/Info'
import './InfoLoader.css'

const InfoLoader = (props) => (
  <div
    className={
      props.recursive
        ? 'infoWrapper'
        : 'infoWrapper col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6'
    }
  >
    {<div>{props.data.entities[0].entity_name}</div>}
    {/* <Info data={props.data} eid={props.eid} /> */}
    {props.hasConnectLine && <div className="connectLine" />}
  </div>
)

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    data: state.connections.entityDetails[props.eid].data,
  }))
)(InfoLoader)
