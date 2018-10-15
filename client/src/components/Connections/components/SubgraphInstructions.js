// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {Input} from 'reactstrap'
import {updateValue} from '../../../actions/sharedActions'
import {addNeighboursLimitSelector} from '../../../selectors'
import {setAddNeighboursLimit} from '../../../actions/connectionsActions'
import {ADD_NEIGHBOURS_LIMIT} from '../../../constants'

import type {State} from '../../../state'

type Props = {
  limit: number,
  handleLimitChange: (e: Event) => void,
  limitSettingsOpen: boolean,
  openLimitSettings: (e: Event) => void,
  closeLimitSettings: (e: Event) => void,
  submitOnEnter: (e: KeyboardEvent) => void,
  updateValue: Function,
  setAddNeighboursLimit: Function,
  setLimitSettingsOpen: (open: boolean) => void,
}


const SubgraphInstructions = ({
  limit,
  handleLimitChange,
  limitSettingsOpen,
  openLimitSettings,
  closeLimitSettings,
  submitOnEnter,
}: Props) => (
  <React.Fragment>
    Ovládanie:
    <ul>
      <li>
        <i>Ťahaním</i> mena ho premiestnite.
      </li>
      <li>
        <i>Kliknutím</i> na meno zobrazíte detailné informácie v boxe pod grafom.
      </li>
      <li>
        <i>Dvojkliknutím</i> na meno pridáte ďalších {limitSettingsOpen
          ? <Input
            className="limit-input"
            value={limit || ''}
            onChange={handleLimitChange}
            onBlur={closeLimitSettings}
            onKeyPress={submitOnEnter}
            autoFocus
          />
          : <b className="limit" onClick={openLimitSettings}>{limit}</b>
        } nezobrazených susedov.</li>
      <li>
        <i>Potrasením</i> mena ho odstránite zo schémy (spolu s jeho výlučnými susedmi).
      </li>
    </ul>
  </React.Fragment>
)

export default compose(
  connect(
    (state: State) => ({
      limit: addNeighboursLimitSelector(state),
    }),
    {updateValue, setAddNeighboursLimit}
  ),
  withState('limitSettingsOpen', 'setLimitSettingsOpen', false),
  withHandlers({
    handleLimitChange: (props: Props) => (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        const {value} = e.target
        const limit = Number(value)
        if (value === '' || (Number.isInteger(limit) && limit >= 0)) {
          props.setAddNeighboursLimit(value === '' ? null : limit)
        }
      }
    },
    openLimitSettings: (props: Props) => () =>
      props.setLimitSettingsOpen(true),
    closeLimitSettings: (props: Props) => () => {
      props.limit || props.setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
      props.setLimitSettingsOpen(false)
    },
    submitOnEnter: (props: Props) => (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        props.limit || props.setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
        props.setLimitSettingsOpen(false)
      }
    },
  })
)(SubgraphInstructions)
