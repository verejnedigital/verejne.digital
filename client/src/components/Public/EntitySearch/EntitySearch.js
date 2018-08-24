// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon,
  Form,
  FormGroup,
  FormText,
} from 'reactstrap'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import EntitySearchResult from '../EntitySearchResult/EntitySearchResult'
import {
  entitySearchValueSelector,
  entitySearchModalOpenSelector,
  entitySearchEidsSelector,
  entitySearchForSelector,
} from '../../../selectors'
import {toggleModalOpen, setEntitySearchFor, toggleDrawer} from '../../../actions/publicActions'
import {updateValue} from '../../../actions/sharedActions'
import {FIND_ENTITY_TITLE} from '../../../constants'
import './EntitySearch.css'

type EntitySearchProps = {|
  entitySearchModalOpen: boolean,
  toggleModalOpen: () => void,
  className: string,
  entitySearchValue: string,
  setEntitySearchValue: (updateValue: string) => void,
  findEntities: (setEntitySearchFor: Function, entitySearchValue: string) => void,
  entitySearchEids: Array<number>,
  entitySearchFor: string,
|}

type PluralityProps = {
  count: number,
}

const EntitySearch = ({
  entitySearchModalOpen,
  toggleModalOpen,
  className,
  entitySearchValue,
  setEntitySearchValue,
  findEntities,
  entitySearchEids,
  entitySearchFor,
}: EntitySearchProps) => {
  const plurality = ({count}: PluralityProps) => {
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
        <button type="button" className="close" onClick={toggleModalOpen}>
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
      entitySearchModalOpen: entitySearchModalOpenSelector(state),
      entitySearchEids: entitySearchEidsSelector(state),
      entitySearchFor: entitySearchForSelector(state),
    }),
    {toggleModalOpen, setEntitySearchFor, updateValue, toggleDrawer}
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
