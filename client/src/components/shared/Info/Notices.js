// @flow
import React from 'react'
import ExternalLink from '../ExternalLink'

import InfoButton from './InfoButton'
import {ShowNumberCurrency} from '../../../services/utilities'
import type {Notices as NoticesType, NoticeNew} from '../../../state'

type NoticesProps = {|
  data: NoticesType,
|}

const Notices = ({data}: NoticesProps) => (
  <InfoButton
    label="Obstarávania"
    count={data.count}
    priceSum={data.total_final_value_amount_eur_sum}
    list={data.most_recent}
    buildItem={(notice: NoticeNew) => (
      <li key={notice.id} title={notice.title}>
        <ExternalLink url={`${window.location.host}/obstaravania/${notice.notice_id}`}>
          <div>
            <b>{notice.client_name}</b>
            {notice.total_final_value_amount ? ', ' : ''}
            <ShowNumberCurrency num={notice.total_final_value_amount} />
          </div>
          {notice.title}
        </ExternalLink>
      </li>
    )}
  />
)

export default Notices
