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

const EntitySearchResultItem = ({entities, showOnMap, firmy_data}: Props) => {
  return (
    <div className="list-group-item">
      <b>
        {entities[0].entity_name}
        <img src={MapIcon} className="location" onClick={showOnMap} title="Zobraz na mape" />
      </b>
      <div>{entities[0].address}</div>
      {/*TODO more work here + separate component*/}
      {firmy_data[0] && (
        <div>
          IČO:{' '}
          <a href={`https://www.finstat.sk/${firmy_data.ico}`} target="_blank">
            {firmy_data[0].ico}
          </a>
        </div>
      )}
    </div>
  )
}

// NOTE (Emo): Ideally we should download all the entries at once and this should
// be strictly presentional component
export default compose(
  connect(null, {zoomToLocation, toggleModalOpen}),
  withStateHandlers(
    {data: undefined},
    {
      onData: (props) => (data) => {
        if (!data.firmy_data[0]) console.log('aaa', data)
        return {...data}
      },
    }
  ),
  withHandlers({
    bindedOnData: ({onData}) => () => (ref, data) => onData(data),
    showOnMap: ({entities, toggleModalOpen, zoomToLocation}) => () => {
      toggleModalOpen()
      zoomToLocation(entities[0], ENTITY_CLOSE_ZOOM)
    },
  }),
  withDataProviders(({eid, bindedOnData}) => [singleEntityProvider(eid, bindedOnData)])
)(EntitySearchResultItem)
