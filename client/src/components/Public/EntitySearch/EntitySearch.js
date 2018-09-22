// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {entitySearchEidsSelector, entitySearchForSelector} from '../../../selectors'
import {toggleEntitySearchOpen} from '../../../actions/publicActions'
import {resultPlurality} from '../../../services/utilities'
import './EntitySearch.css'

import type {State} from '../../../state'

type EntitySearchProps = {
  toggleEntitySearchOpen: () => Object,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
}

const EntitySearch = ({
  toggleEntitySearchOpen,
  entitySearchEids,
  entitySearchFor,
}: EntitySearchProps) => (
  <div className="search-results">
    <div className="search-results-header">
      <button type="button" className="close" onClick={toggleEntitySearchOpen}>
        <span>&times;</span>
      </button>
      {entitySearchFor && `${resultPlurality(entitySearchEids.length)} pre "${entitySearchFor}".`}
    </div>
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
    }),
    {toggleEntitySearchOpen}
  )
)(EntitySearch)
