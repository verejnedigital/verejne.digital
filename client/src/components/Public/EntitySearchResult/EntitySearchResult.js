// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {
  sortedEntitySearchDetailsSelector,
  entitySearchForSelector,
  entitySearchEidsSelector,
} from '../../../selectors'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import EntitySearchResultItem from '../EntitySearchResultItem/EntitySearchResultItem'
import type {NewEntityDetail} from '../../../state'

type Props = {
  searchFor: string,
  entitySearchEids: Array<number>,
  entityDetails: Array<NewEntityDetail>,
}

const EntitySearchResult = ({entityDetails}: Props) =>
  entityDetails.map((e) => <EntitySearchResultItem key={e.eid} data={e} />)

export default compose(
  connect((state) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
    entityDetails: sortedEntitySearchDetailsSelector(state),
  })),
  branch(
    ({searchFor}) => searchFor.trim() !== '',
    withDataProviders(({searchFor}) => [entitySearchProvider(searchFor, true)])
  ),
  branch(
    ({entitySearchEids}) => entitySearchEids.length > 0,
    withDataProviders(({entitySearchEids}) => [entityDetailProvider(entitySearchEids)])
  )
)(EntitySearchResult)
