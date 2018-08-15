// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {entitySearchForSelector, entitySearchEidsSelector} from '../../../selectors'
import {entitiesSearchResultEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import EntitySearchResultItem from '../EntitySearchResultItem'

type Props = {
  searchFor: string,
  entitySearchEids: Array<number>,
}

const EntitySearchResult = ({entitySearchEids}: Props) =>
  entitySearchEids
    ? entitySearchEids.map((eid: number, index: number) => (
      <EntitySearchResultItem key={index} eid={eid} />
    ))
    : null

export default compose(
  connect((state) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
  })),
  withDataProviders(({searchFor}) => [entitiesSearchResultEidsProvider(searchFor)])
)(EntitySearchResult)
