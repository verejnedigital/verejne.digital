// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {map} from 'lodash'

import {entitySearchForSelector, entitySearchEidsSelector} from '../../../selectors'
import {entitiesSearchResultEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import EntitySearchResultItem from '../EntitySearchResultItem'

type Props = {
  searchFor: string,
  entitySearchEids: ?Array<string>,
}

const EntitySearchResult = ({entitySearchEids}: Props) =>
  map(entitySearchEids, (eid: string, index: number) => (
    <EntitySearchResultItem key={index} eid={eid} />
  ))

export default compose(
  connect((state) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
  })),
  withDataProviders(({searchFor}) => [entitiesSearchResultEidsProvider(searchFor)])
)(EntitySearchResult)
