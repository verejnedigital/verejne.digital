import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRefetch} from 'data-provider'
import {obstaravaniaProvider} from '../dataProviders/obstaravaniaDataProviders'

const Obstaravania = ({dispatch}) => <div>Obstaravania placeholder</div>

export default compose(
  withRefetch((props) => [obstaravaniaProvider()]),
  connect((state) => ({data: state.obstaravania.data}))
)(Obstaravania)
