import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withRefetch} from 'data-provider'
import {noticesProvider} from '../dataProviders/noticesDataProviders'

const Notices = ({dispatch}) => <div>Obstaravania placeholder</div>

export default compose(
  withRefetch((props) => [noticesProvider()]),
  connect((state) => ({data: state.notices.data}))
)(Notices)
