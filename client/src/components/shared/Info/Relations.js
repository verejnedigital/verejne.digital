// @flow
import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {orderBy} from 'lodash'

import RecursiveInfo from './RecursiveInfo'
import {showRelationType, getRelationTitle} from '../../../services/utilities'
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

const Relations = ({data, name, useNewApi, toggledOn, toggle}: RelationsProps) => {
  const relationList = orderBy(data, ['edge_types']).map((related: RelatedEntity, i) => {
    const badge =
      related.edge_types &&
      related.edge_types.map((type: number, i: number) => {
        const title = getRelationTitle(type, name, related.name)
        return (
          <Badge
            key={type}
            color={type > 0 ? 'dark' : 'secondary'}
            title={title}
            className="mr-1 info-badge"
          >
            {showRelationType(type, related.edge_type_texts[i])}
          </Badge>
        )
      })
    return (
      <li key={related.eid} className="">
        <RecursiveInfo name={related.name} eid={related.eid} useNewApi={useNewApi} badge={badge} />
      </li>
    )
  })
  return (
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
      {toggledOn && <ul className="list-unstyled info-button-list">{relationList}</ul>}
    </div>
  )
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(Relations)
