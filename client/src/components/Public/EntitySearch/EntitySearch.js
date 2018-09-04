// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {
  entitySearchValueSelector,
  entitySearchOpenSelector,
  entitySearchEidsSelector,
  entitySearchForSelector,
} from '../../../selectors'
import {toggleEntitySearchOpen, setEntitySearchFor, toggleDrawer} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import './EntitySearch.css'

type EntitySearchProps = {|
  entitySearchOpen: boolean,
  toggleEntitySearchOpen: () => void,
  className: string,
  entitySearchValue: string,
  setEntitySearchValue: (updateValue: string) => void,
  findEntities: (setEntitySearchFor: Function, entitySearchValue: string) => void,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
|}

const EntitySearch = ({
  entitySearchOpen,
  toggleEntitySearchOpen,
  className,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
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
      entitySearchValue: entitySearchValueSelector(state),
      entitySearchOpen: entitySearchOpenSelector(state),
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {toggleEntitySearchOpen, setEntitySearchFor, updateValue, toggleDrawer}
  ),
  withHandlers({
    findEntities: ({setEntitySearchFor, entitySearchValue, toggleDrawer}) => (e) => {
      e.preventDefault()
      setEntitySearchFor(entitySearchValue)
      toggleDrawer()
    },
    setEntitySearchValue: ({updateValue}) => (e) =>
      updateValue(
        ['publicly', 'entitySearchValue'],
        e.target.value,
        'Set entity search field value'
      ),
  })
)(EntitySearch)
