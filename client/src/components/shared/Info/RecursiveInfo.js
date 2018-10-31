// @flow
import React, {Fragment, type Node} from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import CompanyDetails from '../CompanyDetails'
import CircleIcon from '../CircleIcon'
import type {StateUpdater} from '../../../types/commonTypes'
import type {RelatedEntity} from '../../../state'


type RecursiveInfoProps = {|
  related: RelatedEntity,
  badge: Node,
  useNewApi: boolean,
  toggledOn: boolean,
  toggle: () => void,
|}

type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const RecursiveInfo = ({related, badge, useNewApi, toggledOn, toggle}: RecursiveInfoProps) =>
  toggledOn ? (
    <CompanyDetails eid={related.eid} onClose={toggle} />
  ) : (
    <Fragment>
      {badge}
      <span className="d-inline-block">
        <CircleIcon data={related} size="14" />
        &nbsp;
        <Button onClick={toggle} color="link" className="p-0">
          {related.name}
        </Button>
      </span>
    </Fragment>
  )

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(RecursiveInfo)
