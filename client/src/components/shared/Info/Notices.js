// @flow
import React from 'react'

import InfoButton from './InfoButton'
import {ShowNumberCurrency} from '../../../services/utilities'
import type {Notices as NoticesType, NoticeNew} from '../../../state'

type NoticesProps = {
  data: NoticesType,
}

const Notices = ({data}: NoticesProps) => (
  <InfoButton
    label="Zmluvy so štátom"
    count={data.count}
    priceSum={data.total_final_value_amount_eur_sum}
    list={data.most_recent}
    buildItem={(notice: NoticeNew) => (
      <li key={notice.id} title={notice.title}>
        {`${notice.client_name}, `}
        <ShowNumberCurrency num={notice.total_final_value_amount} />
      </li>
    )}
  />
)

export default Notices
