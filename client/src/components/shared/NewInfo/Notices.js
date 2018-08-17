import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import ChevronUp from 'react-icons/lib/fa/chevron-up'
import ChevronDown from 'react-icons/lib/fa/chevron-down'
import {Badge, Button} from 'reactstrap'

import {ShowNumberCurrency} from '../../../services/utilities'
import '../Info/InfoButton.css'

const Notices = ({data, toggledOn, toggle}) => (
  <div className="notices info-button">
    <Button outline color="primary" onClick={toggle}>
      {toggledOn ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      &nbsp;Zmluvy so štátom:&nbsp;<ShowNumberCurrency
        num={data.total_final_value_amount_eur_sum}
      />&nbsp;
      <Badge color="primary">{data.count}</Badge>
    </Button>
    {toggledOn && (
      <ul className="list-unstyled info-button-list">
        {data.most_recent.map((notice) => (
          <li key={notice.id} title={notice.title}>
            {`${notice.client_name}, `}
            <ShowNumberCurrency num={notice.total_final_value_amount} />
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}) => () => toggle((current) => !current),
  })
)(Notices)
