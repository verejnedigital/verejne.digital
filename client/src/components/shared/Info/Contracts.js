import React from 'react'
import ExternalLink from '../ExternalLink'
import {showNumberCurrency} from '../../Notices/utilities'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import './InfoList.css'

const _Contracts = (({data, toggledOn, toggle}) => {
  return [
    <tr key="header" className="clickable" onClick={toggle}>
      <td>
        <button className="showHideBtn btn btn-link">
          Zmluvy
        </button>
      </td>
      <td className="sizeCell">
        <strong>{data.length}</strong>
        {toggledOn ? (
          <ChevronUp
            className="sizeCellArrow"
            onClick={toggle}
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="sizeCellArrow"
            onClick={toggle}
            aria-hidden="true"
          />
        )}
      </td>
    </tr>,
    toggledOn
      ? (
        <tr className="noBorder">
          <td colSpan="2">
            <ul className="contractList list-unstyled">
              {data.map((contract) => (
                <li key={contract.source}>
                  <ExternalLink
                    url={contract.source}
                    text={[contract.customer, ', ', showNumberCurrency(contract.total)]}
                  />
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )
      : null,
  ]
})

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => (e) => toggle((current) => !current),
  })
)(_Contracts)
