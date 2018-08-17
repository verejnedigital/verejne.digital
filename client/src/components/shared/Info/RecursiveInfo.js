import React from 'react'
import CompanyDetails from '../CompanyDetails'
import {compose, withState, withHandlers} from 'recompose'
import {Button} from 'reactstrap'
import './RecursiveInfo.css'

const _RecursiveInfo = ({name, eid, useNewApi, toggledOn, toggle}) => {
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
    toggle: ({toggle}) => () => toggle((current) => !current),
  })
)(_RecursiveInfo)
