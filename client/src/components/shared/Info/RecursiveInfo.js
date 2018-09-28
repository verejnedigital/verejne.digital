// @flow
import React, {Fragment, type Node} from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import CompanyDetails from '../CompanyDetails'
import type {StateUpdater} from '../../../types/commonTypes'

type RecursiveInfoProps = {|
  name: string,
  eid: number,
  badge: Node,
  useNewApi: boolean,
  toggledOn: boolean,
  toggle: () => void,
|}

type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const RecursiveInfo = ({name, eid, badge, useNewApi, toggledOn, toggle}: RecursiveInfoProps) =>
  toggledOn ? (
    <CompanyDetails useNewApi={useNewApi} eid={eid} onClose={toggle} />
  ) : (
    <Fragment>
      {badge}
      <Button onClick={toggle} color="link" className="p-0">
        {name}
      </Button>
    </Fragment>
  )

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(RecursiveInfo)
