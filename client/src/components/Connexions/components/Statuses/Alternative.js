import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'

import {connexionEntityDetailProvider} from '../../../../dataProviders/connexionsDataProviders'

const Alternative = (props) => <span>{props.name}</span>

export default compose(
  withDataProviders((props) => [connexionEntityDetailProvider(props.eid)]),
  connect((state, props) => ({
    name: state.connexions.entityDetails[props.eid].name,
  }))
)(Alternative)
