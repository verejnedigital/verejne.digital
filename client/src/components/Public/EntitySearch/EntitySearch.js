// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {
  entitySearchEidsSelector,
  entitySearchForSelector,
  entitySearchLoadedSelector,
} from '../../../selectors'
import {toggleEntitySearchOpen} from '../../../actions/publicActions'
import {resultPlurality} from '../../../services/utilities'
import './EntitySearch.css'

import type {State} from '../../../state'

type EntitySearchProps = {
  toggleEntitySearchOpen: () => Object,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
  entitySearchLoaded: boolean,
}

const EntitySearch = ({
  toggleEntitySearchOpen,
  entitySearchEids,
  entitySearchFor,
  entitySearchLoaded,
}: EntitySearchProps) => (
  <div className="search-results">
    {entitySearchLoaded && (
      <div className="search-results-header">
        <button type="button" className="close" onClick={toggleEntitySearchOpen}>
          <span>&times;</span>
        </button>
        {`${resultPlurality(entitySearchEids.length)} pre "${entitySearchFor}".`}
      </div>
    )}
    <div className="search-results-panel">
      <EntitySearchResult />
    </div>
    <div className="search-results-footer" />
  </div>
)

export default compose(
  connect(
    (state: State) => ({
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
      entitySearchLoaded: entitySearchLoadedSelector(state),
    }),
    {toggleEntitySearchOpen}
  )
)(EntitySearch)
