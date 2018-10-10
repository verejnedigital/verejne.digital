// @flow
import React, {Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {chunk} from 'lodash'
import Info from '../../shared/Info/Info'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import {entityDetailsSelector} from '../../../selectors/index'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../constants'
import type {NewEntityDetail} from '../../../state'
import type {ObjectMap} from '../../../types/commonTypes'
import './InfoLoader.css'

type Props = {
  eids: number[],
  data: ObjectMap<NewEntityDetail>,
}

const InfoLoader = ({data, eids}: Props) => (
  <Fragment>
    {eids.map((eid) => (
      <div className="info-loader" key={eid}>
        <Info data={data[eid]} />
        <div className="container">
          <div className="info-loader-connection-line" />
        </div>
      </div>
    ))}
  </Fragment>
)

export default compose(
  withDataProviders(({eids}: Props) =>
    chunk(eids, MAX_ENTITY_REQUEST_COUNT).map((ids) => entityDetailProvider(ids))
  ),
  connect((state, {eids}) => ({
    data: entityDetailsSelector(state, eids),
  }))
)(InfoLoader)
