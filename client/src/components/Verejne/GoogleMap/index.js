import React from 'react'
import GMap from 'google-map-react'
import {map} from 'lodash'
import Marker from './Marker'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {mapOptionsSelector, mapReferenceSelector, entitiesSelector} from '../../../selectors'
import {initializeGoogleMap, fetchEntities, updateMapOptions} from '../../../actions/verejneActions'
import {GOOGLE_MAP_API_KEY, createMapOptions, clusterOptions} from '../../../constants'
import supercluster from 'points-cluster'
import './GoogleMap.css'

class GoogleMap extends React.Component {
  getClusters = (entities) => {
    const clusters = supercluster(entities, clusterOptions)
    return clusters(this.props.mapOptions)
  }

  createClusters = () => {
    const clusters = this.props.mapOptions.bounds ?
      this.getClusters(this.props.entities).map(({wx, wy, numPoints, points}, i) => {
        return {
          lat: wy,
          lng: wx,
          numPoints,
          id: `${i}`,
          points,
        }
      }) : []
    return clusters
  }

  render() {
    return (
      <div className="GoogleMapWrapper">
        <GMap
          bootstrapURLKeys={{key: GOOGLE_MAP_API_KEY, language: 'sk', region: 'sk'}}
          className={classnames('GoogleMap', this.props.className)}
          center={this.props.mapOptions.center}
          zoom={this.props.mapOptions.zoom}
          options={createMapOptions}
          onGoogleApiLoaded={({map, maps}) => this.props.initializeGoogleMap(map)}
          onChange={this.props.updateMapOptions}
          yesIWantToUseGoogleMapApiInternals
        >
          {map(this.createClusters(), (e, i) => {
            return (
              <Marker key={i} lat={e.lat} lng={e.lng} numPoints={e.numPoints} />
            )
          })}
        </GMap>
      </div >
    )
  }
}

export default connect(
  (state) => {
    return ({
      mapOptions: mapOptionsSelector(state),
      mapReference: mapReferenceSelector(state),
      entities: entitiesSelector(state),
    })
  },
  {
    initializeGoogleMap,
    fetchEntities,
    updateMapOptions,
  },
)(GoogleMap)
