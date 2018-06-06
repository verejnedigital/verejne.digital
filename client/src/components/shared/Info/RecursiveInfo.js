import React from 'react'
import CompanyDetails from '../CompanyDetails'
import {compose, withState, withHandlers} from 'recompose'
import './RecursiveInfo.css'

const _RecursiveInfo = (({name, eid, toggledOn, toggle}) => {
  if (toggledOn) {
    return (
      <div className="recursive-info-wrapper">
        <div className="recursive-info">
          <CompanyDetails eid={eid} />
        </div>
      </div>
    )
  } else {
    return (
      <button onClick={toggle} className="recursive-info-btn btn btn-link">
        {name}
      </button>
    )
  }
})

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_RecursiveInfo)
