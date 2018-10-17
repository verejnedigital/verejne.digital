import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {Col, Input} from 'reactstrap'
import {addNeighboursLimitSelector} from '../../../selectors'
import {setAddNeighboursLimit} from '../../../actions/connectionsActions'
import {ADD_NEIGHBOURS_LIMIT} from '../../../constants'

type Props = {
  limit: number,
  limitSettingsOpen: boolean,
  setLimitSettingsOpen: (open: boolean) => void,
  handleLimitChange: (e: Event) => void,
  openLimitSettings: (e: Event) => void,
  closeLimitSettings: (e: Event) => void,
  submitOnEnter: (e: KeyboardEvent) => void,
  setAddNeighboursLimit: Function,
}

const GraphControls = ({
  limitSettingsOpen,
  openLimitSettings,
  limit,
  handleLimitChange,
  closeLimitSettings,
  submitOnEnter,
}) => (
  <Col sm="12" lg="7">
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
  </Col>
)
export default compose(
  withState('limitSettingsOpen', 'setLimitSettingsOpen', false),
  connect(
    (state) => ({
      limit: addNeighboursLimitSelector(state),
    }),
    {setAddNeighboursLimit}
  ),
  withHandlers({
    handleLimitChange: ({setAddNeighboursLimit}: Props) => (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        const {value} = e.target
        const limit = Number(value)
        if (value === '' || (Number.isInteger(limit) && limit >= 0)) {
          setAddNeighboursLimit(value === '' ? null : limit)
        }
      }
    },
    openLimitSettings: ({setLimitSettingsOpen}: Props) => () => setLimitSettingsOpen(true),
    closeLimitSettings: ({limit, setAddNeighboursLimit, setLimitSettingsOpen}: Props) => () => {
      limit || setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
      setLimitSettingsOpen(false)
    },
    submitOnEnter: ({limit, setAddNeighboursLimit, setLimitSettingsOpen}: Props) => (
      e: KeyboardEvent
    ) => {
      if (e.key === 'Enter') {
        limit || setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
        setLimitSettingsOpen(false)
      }
    },
  })
)(GraphControls)
