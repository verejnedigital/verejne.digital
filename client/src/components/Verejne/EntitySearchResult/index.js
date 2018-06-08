// @flow
import React from 'react'
import {connect} from 'react-redux'
import {entitySearchForSelector, entitySearchEidsSelector} from '../../../selectors'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {entitiesSearchResultEidsProvider} from '../../../dataProviders/publiclyDataProviders'
import EntityContainer from './EntityContainer'
import {map} from 'lodash'

type Props = {
  searchFor: string,
  entitySearchEids: ?Array<string>,
}

const EntitySearchResult = ({entitySearchEids}: Props) => (
  <div>{map(entitySearchEids, (eid, i) => <EntityContainer key={i} eid={eid} />)}</div>
)

export default compose(
  connect((state) => ({
    searchFor: entitySearchForSelector(state),
    entitySearchEids: entitySearchEidsSelector(state),
  })),
  withDataProviders(({searchFor}) => [entitiesSearchResultEidsProvider(searchFor)])
)(EntitySearchResult)
