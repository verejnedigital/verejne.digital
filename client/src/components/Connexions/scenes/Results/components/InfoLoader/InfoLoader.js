import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connexionEntityDetailProvider} from '../../../../../../dataProviders/connexionsDataProviders'
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
  withDataProviders((props) => [connexionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    data: state.connexions.entityDetails[props.eid].data,
  }))
)(InfoLoader)
