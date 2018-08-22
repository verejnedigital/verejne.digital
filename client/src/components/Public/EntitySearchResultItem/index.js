// @flow
import React from 'react'
import {withDataProviders} from 'data-provider'
import {withStateHandlers, compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {singleEntityProvider} from '../../../dataProviders/publiclyDataProviders'
import {toggleModalOpen, zoomToLocation} from '../../../actions/verejneActions'
import './EntitySearchResultItem.css'
import Info from '../../shared/Info/Info'

type Props = {
  eid: string,
  firmy_data: [?{ico: string}],
  new_orsr_data: [?{ico: string}],
}

const EntitySearchResultItem = (props: Props) => {
  return (
    <div style={{marginBottom: '1rem'}}>
      <Info data={props} />
    </div>
  )
}

// NOTE (Emo): Ideally we should download all the entries at once and this should
// be strictly presentional component
export default compose(
  connect(null, {zoomToLocation, toggleModalOpen}),
  withStateHandlers({data: undefined}, {onData: (props) => (data) => ({...data})}),
  withHandlers({
    bindedOnData: ({onData}) => () => (ref, data) => onData(data),
  }),
  withDataProviders(({eid, bindedOnData}) => [singleEntityProvider(eid, bindedOnData)])
)(EntitySearchResultItem)
