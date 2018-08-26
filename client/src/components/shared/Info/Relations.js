// @flow
import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Badge, Button} from 'reactstrap'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {orderBy} from 'lodash'

import RecursiveInfo from './RecursiveInfo'
import {showRelationType} from '../../../services/utilities'
import type {RelatedEntity} from '../../../state'
import type {StateUpdater} from '../../../types/commonTypes'
import './InfoButton.css'

type RelationsProps = {|
  data: Array<RelatedEntity>,
  useNewApi: boolean,
  toggledOn: boolean,
  toggle: () => void,
|}
type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const Relations = ({data, useNewApi, toggledOn, toggle}: RelationsProps) => {
  return (
    <div className="relations info-button">
      <Button outline color="primary" onClick={toggle}>
        {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />} Vzťahy{' '}
        <Badge color="primary">{data.length}</Badge>
      </Button>
      {toggledOn && (
        <ul className="list-unstyled info-button-list">
          {orderBy(data, ['edge_types']).map((related: RelatedEntity) => (
            <li key={related.eid}>
              {related.edge_types &&
                related.edge_types.map((type: number, i: number) => (
                  <Badge key={type} color={type > 0 ? 'dark' : 'secondary'} className="mr-1">
                    {showRelationType(type, related.edge_type_texts[i])}
                  </Badge>
                ))}
              <RecursiveInfo name={related.name} eid={related.eid} useNewApi={useNewApi} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(Relations)
