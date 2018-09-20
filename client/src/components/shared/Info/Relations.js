// @flow
import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import RelationList from './RelationList'

import type {RelatedEntity} from '../../../state'
import type {StateUpdater} from '../../../types/commonTypes'
import './InfoButton.css'

type RelationsProps = {|
  data: Array<RelatedEntity>,
  name: string,
  useNewApi: boolean,
  toggledOn: boolean,
  toggle: () => void,
|}
type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const Relations = ({data, name, useNewApi, toggledOn, toggle}: RelationsProps) => (
  <div className="relations info-button">
    <Button outline color="primary" onClick={toggle}>
      {toggledOn ? (
        <ChevronUp aria-hidden="true" className="mb-1" />
      ) : (
        <ChevronDown aria-hidden="true" className="mb-1" />
      )}{' '}
      Vzťahy{' '}
      <Badge color="primary" className="info-badge info-badge-number">
        {data.length}
      </Badge>
    </Button>
    {toggledOn && <RelationList data={data} name={name} useNewApi />}
  </div>
)

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(Relations)
