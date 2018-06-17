import React from 'react'
import RecursiveInfo from './RecursiveInfo'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import './InfoList.css'

const _Relations = ({data, toggledOn, toggle}) => {
  return [
    <tr key="header" onClick={toggle} className="clickable">
      <td>
        <button className="showHideBtn btn btn-link">Vzťahy</button>
      </td>
      <td className="sizeCell">
        <strong>{data.length}</strong>
        {toggledOn ? (
          <ChevronUp className="sizeCellArrow" aria-hidden="true" />
        ) : (
          <ChevronDown className="sizeCellArrow" aria-hidden="true" />
        )}
      </td>
    </tr>,
    toggledOn ? (
      <tr className="noBorder" key="relations">
        <td colSpan="2">
          <ul className="contractList list-unstyled">
            {data.map((related, i) => (
              <li key={related.eid}>
                <RecursiveInfo key={i} name={related.name} eid={related.eid} />
              </li>
            ))}
          </ul>
        </td>
      </tr>
    ) : null,
  ]
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_Relations)
