import React from 'react'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../Notices/utilities'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import './InfoList.css'

const _Contracts = ({data, toggledOn, toggle}) => {
  return [
    <tr key="header" className="clickable" onClick={toggle}>
      <td>
        <button className="showHideBtn btn btn-link">Zmluvy</button>
      </td>
      <td className="sizeCell">
        <strong>{data.length}</strong>
        {toggledOn ? (
          <ChevronUp className="sizeCellArrow" onClick={toggle} aria-hidden="true" />
        ) : (
          <ChevronDown className="sizeCellArrow" onClick={toggle} aria-hidden="true" />
        )}
      </td>
    </tr>,
    toggledOn && (
      <tr className="noBorder" key="contracts-table">
        <td colSpan="2">
          <ul className="contractList list-unstyled">
            {data.map((contract, index) => (
              <li key={index}>
                <ExternalLink url={contract.source}>
                  {`${contract.customer}, `}
                  <ShowNumberCurrency num={contract.total} />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </td>
      </tr>
    ),
  ]
}

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_Contracts)
