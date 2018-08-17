import React from 'react'
import CompanyDetails from '../CompanyDetails'
import {compose, withState, withHandlers} from 'recompose'
import './RecursiveInfo.css'

const _RecursiveInfo = ({name, eid, useNewApi, toggledOn, toggle}) => {
  if (toggledOn) {
    return <CompanyDetails useNewApi={useNewApi} eid={eid} />
  } else {
    return (
      //
      <button onClick={toggle} className="recursive-info-btn btn btn-link">
        {name}
      </button>
    )
  }
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => () => toggle((current) => !current),
  })
)(_RecursiveInfo)
