// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {entitySearchForSelector, entitySearchEidsSelector} from '../../../selectors'
import {
  entitySearchProvider,
  entityDetailProvider,
} from '../../../dataProviders/sharedDataProviders'
import EntitySearchResultItem from '../EntitySearchResultItem/EntitySearchResultItem'

import type {State} from '../../../state'

type EntitySearchResultProps = {
  searchFor: string,
  entitySearchEids: Array<number>,
}

const EntitySearchResult = ({entitySearchEids}: EntitySearchResultProps) =>
  entitySearchEids.map((eid) => <EntitySearchResultItem key={eid} eid={eid} />)

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
  )
)(EntitySearchResult)
