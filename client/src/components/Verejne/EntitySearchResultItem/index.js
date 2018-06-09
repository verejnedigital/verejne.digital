// @flow
import React from 'react'
import {withDataProviders} from 'data-provider'
import {withStateHandlers, compose, withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {singleEntityProvider} from '../../../dataProviders/publiclyDataProviders'
import {toggleModalOpen, zoomToLocation} from '../../../actions/verejneActions'
import './EntitySearchResultItem.css'
import MapIcon from '../../../assets/mapIcon.svg'
import {ENTITY_CLOSE_ZOOM} from '../../../constants'
import Info from '../../shared/Info/Info'

type SearchedEntity = {
  address: string,
  entity_name: string,
  lat: number,
  lng: number,
}

type Props = {
  eid: string,
  entities: [SearchedEntity],
  firmy_data: [?{ico: string}],
  new_orsr_data: [?{ico: string}],
  showOnMap: Function,
}

const EntitySearchResultItem = (props: Props) => {
  const {entities, showOnMap} = props
  return (
    <div className="list-group-item">
      <b>
        {entities[0].entity_name}
        <img src={MapIcon} className="location" onClick={showOnMap} title="Zobraz na mape" />
      </b>
      <div>{entities[0].address}</div>
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
    showOnMap: ({entities, toggleModalOpen, zoomToLocation}) => () => {
      toggleModalOpen()
      zoomToLocation(entities[0], ENTITY_CLOSE_ZOOM)
    },
  }),
  withDataProviders(({eid, bindedOnData}) => [singleEntityProvider(eid, bindedOnData)])
)(EntitySearchResultItem)
