// @flow
import React from 'react'
import {compose, withState, withHandlers} from 'recompose'
import {FaChevronUp, FaChevronDown} from 'react-icons/fa'
import {Badge, Button} from 'reactstrap'
import type {Node} from 'react'

import {ShowNumberCurrency} from '../../../services/utilities'
import type {Contract, NoticeNew, Eufund} from '../../../state'
import type {StateUpdater} from '../../../types/commonTypes'

import './InfoButton.css'

type InfoButtonProps<T> = {|
  label: string,
  count: number,
  priceSum: number,
  list: Array<T>,
  buildItem: (T, number, Array<T>) => Node,
  toggledOn: boolean,
  toggle: () => void,
|}
type StateProps = {
  toggledOn: boolean,
  toggle: StateUpdater<boolean>,
}

const InfoButton = ({
  label,
  count,
  priceSum,
  list,
  buildItem,
  toggledOn,
  toggle,
}: InfoButtonProps<Contract | NoticeNew | Eufund>) => (
  <div className="contracts info-button">
    <Button outline color="primary" onClick={toggle}>
      {toggledOn ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
      &nbsp;{label}:&nbsp;
      <ShowNumberCurrency num={priceSum} />
      &nbsp;
      <Badge color="primary">{count}</Badge>
    </Button>
    {toggledOn && <ul className="list-unstyled info-button-list">{list.map(buildItem)}</ul>}
  </div>
)

export default compose(
  withState('toggledOn', 'toggle', false),
  withHandlers({
    toggle: ({toggle}: StateProps) => () => toggle((current: boolean) => !current),
  })
)(InfoButton)
