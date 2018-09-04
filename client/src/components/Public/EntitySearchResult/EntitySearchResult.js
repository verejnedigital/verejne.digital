// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withDataProviders} from 'data-provider'
import {entitySearchForSelector, entitySearchEidsSelector} from '../../../selectors'
import {entitiesSearchResultEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import EntitySearchResultItem from '../EntitySearchResultItem/EntitySearchResultItem'

type Props = {
  searchFor: string,
  entitySearchEids: Array<number>,
}

const EntitySearchResult = ({entitySearchEids}: Props) => (
  entitySearchEids.map((eid) =>
    <EntitySearchResultItem key={eid} eid={eid} />
  )
)

export default compose(
  connect((state) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
  })),
  withDataProviders(
    ({searchFor, entitySearchEids}) => [
      entitiesSearchResultEidsProvider(searchFor),
      entityDetailProvider(entitySearchEids),
    ])
)(EntitySearchResult)
