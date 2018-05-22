// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeDetailProvider} from '../../dataProviders/noticesDataProviders'
import {noticeDetailSelector} from '../../selectors'
import TabLink from './Helpers/ExternalLink'
import {getSuspectLevelLimit, showNumberCurrency} from './utilities'
import DetailList from './DetailList'
import './NoticeDetail.css'
import NoticeInformation from './NoticeInformation'

import type {Notice, State} from '../../state'

export type NoticeDetailProps = {
  notice: Notice,
  match: {
    params: {
      id: string,
    },
  },
}

const NoticeDetail = ({notice}: NoticeDetailProps) => {

  const headerData = [
    {
      label: <span className="my-label">Popis:</span>,
      body: notice.text,
    },
    {
      label: <span className="my-label">Objednávateľ:</span>,
      body: notice.customer,
    },
  ]

  if (notice.bulletin_date) {
    const vestnik = (<span>
      <TabLink
        url={`https://www.uvo.gov.sk/evestnik?poradie=${notice.bulletin_number}&year=${notice.bulletin_year}`}
        text={`${notice.bulletin_number}/${notice.bulletin_year}`}
      /> <span className="note">({notice.bulletin_date})</span>
    </span>
    )

    headerData.push(
      {
        label: <span className="my-label">Vestník:</span>,
        body: vestnik,
      },
    )
  }

  headerData.push(
    {
      label: <span className="my-label">Vyhlásená cena:</span>,
      body: showNumberCurrency(notice.price),
    },
  )

  if (notice.price_num >= 5) {
    const upper = showNumberCurrency(getSuspectLevelLimit(notice, 1))
    const lower = showNumberCurrency(getSuspectLevelLimit(notice, -1))
    headerData.push(
      {
        label: <span className="my-label">Náš odhad:</span>,
        body: [lower, ' - ', upper],
      },
    )
  }

  return (
    <div>
      <div className="row">
        <div className="col-sm-12 col-xs-12">
          <h3 className="title">{notice.title}</h3>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 col-xs-12">
          <div className="section">
            <NoticeInformation data={headerData} />
          </div>
          <div className="connectLine" />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 col-xs-12">
          <DetailList item={notice} />
        </div>
      </div>
    </div>
  )
}

export default compose(
  withDataProviders((props: NoticeDetailProps) => {
    return [noticeDetailProvider(props.match.params.id)]
  }),
  connect((state: State, props: NoticeDetailProps) => ({
    notice: noticeDetailSelector(state, props),
  }))
)(NoticeDetail)
