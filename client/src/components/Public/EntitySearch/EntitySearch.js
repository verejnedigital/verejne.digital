// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {
  entitySearchEidsSelector,
  entitySearchForSelector,
} from '../../../selectors'
import {toggleEntitySearchOpen} from '../../../actions/publicActions'
import './EntitySearch.css'

type EntitySearchProps = {|
  toggleEntitySearchOpen: () => void,
  className: string,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
|}

const EntitySearch = ({
  toggleEntitySearchOpen,
  className,
  entitySearchEids,
  entitySearchFor,
}: EntitySearchProps) => {
  const plurality = (count: number) => {
    if (count === 1) {
      return `Nájdený ${count} výsledok`
    } else if (count > 1 && count < 5) {
      return `Nájdené ${count} výsledky`
    }
    return `Nájdených ${count} výsledkov`
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <button type="button" className="close" onClick={toggleEntitySearchOpen}>
          <span>&times;</span>
        </button>
        {entitySearchFor && `${plurality(entitySearchEids.length)} pre "${entitySearchFor}".`}
      </div>
      <div className="search-results-panel">
        <EntitySearchResult />
      </div>
      <div className="search-results-footer" />
    </div>
  )
}

export default compose(
  connect(
    (state) => ({
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {toggleEntitySearchOpen}
  )
)(EntitySearch)
