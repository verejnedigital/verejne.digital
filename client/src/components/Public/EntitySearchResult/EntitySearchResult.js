// @flow
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {pick, uniqWith, isEqual} from 'lodash'

import {
  sortedEntitySearchDetailsSelector,
  entitySearchForSelector,
  entitySearchEidsSelector,
} from '../../../selectors'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import {
  makeLocationsSelected,
  zoomToLocation,
  setEntitySearchLoaded,
} from '../../../actions/publicActions'
import EntitySearchResultItem from '../EntitySearchResultItem/EntitySearchResultItem'
import {getBoundsFromLocations} from '../../../services/map'
import {NAVBAR_HEIGHT} from '../../../constants'
import type {NewEntityDetail, Center, State} from '../../../state'
import type {ObjectMap} from '../../../types/commonTypes'

type EntitySearchResultProps = {
  searchFor: string,
  entityDetails: ObjectMap<NewEntityDetail>,
  makeLocationsSelected: (Center[]) => void,
  zoomToLocation: (Center, number) => void,
  setEntitySearchLoaded: (loaded: boolean) => void,
}

class EntitySearchResult extends PureComponent<EntitySearchResultProps> {
  componentDidMount() {
    this.highlightLocations()
    this.props.setEntitySearchLoaded(true)
  }

  componentDidUpdate(oldProps) {
    if (this.props.searchFor !== oldProps.searchFor) {
      this.highlightLocations()
      this.props.setEntitySearchLoaded(true)
    }
  }

  highlightLocations = () => {
    const {makeLocationsSelected, entityDetails, zoomToLocation} = this.props
    const locations = uniqWith(
      Object.values(entityDetails).map((detail) => pick(detail, ['lat', 'lng', 'address_id'])),
      isEqual
    )
    makeLocationsSelected(locations)
    const {center, zoom} = getBoundsFromLocations(
      locations,
      window.innerWidth,
      window.innerHeight - NAVBAR_HEIGHT
    )
    zoomToLocation(center, zoom)
  }

  render() {
    const {entityDetails} = this.props
    return Object.keys(entityDetails).map((eid) => (
      <EntitySearchResultItem key={eid} entity={entityDetails[eid]} />
    ))
  }
}

export default compose(
  connect((state: State) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
  })),
  branch(
    ({searchFor}) => searchFor.trim() !== '',
    withDataProviders(({searchFor}) => [entitySearchProvider(searchFor, true)])
  ),
  branch(
    ({entitySearchEids}) => entitySearchEids.length > 0,
    withDataProviders(({entitySearchEids}) => [entityDetailProvider(entitySearchEids)])
  ),
  connect(
    (state: State) => ({
      entityDetails: sortedEntitySearchDetailsSelector(state),
    }),
    {makeLocationsSelected, zoomToLocation, setEntitySearchLoaded}
  )
)(EntitySearchResult)
