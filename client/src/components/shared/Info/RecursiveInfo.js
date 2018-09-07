// @flow
import React from 'react'
import CompanyDetails from '../CompanyDetails'
import {compose, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import type {StateUpdater} from '../../../types/commonTypes'

type RecursiveInfoProps = {|
  name: string,
  eid: number,
  useNewApi: boolean,
  toggledOn: boolean,
  toggle: () => void,
|}
type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const RecursiveInfo = ({name, eid, useNewApi, toggledOn, toggle}: RecursiveInfoProps) => {
  if (toggledOn) {
    return <CompanyDetails useNewApi={useNewApi} eid={eid} />
  } else {
    return (
      <Button onClick={toggle} color="link">
        {name}
      </Button>
    )
  }
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current) => !current),
  })
)(RecursiveInfo)
