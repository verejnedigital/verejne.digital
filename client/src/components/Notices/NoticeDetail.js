// @flow
import React, {Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeDetailProvider} from '../../dataProviders/noticesDataProviders'
import {noticeDetailSelector} from '../../selectors'
import ExternalLink from '../shared/ExternalLink'
import {getSuspectLevelLimit} from './utilities'
import {ShowNumberCurrency} from '../../services/utilities'
import CompaniesTable from './CompaniesTable'
import './NoticeDetail.css'
import NoticeInformation from './NoticeInformation'
import {Container} from 'reactstrap'

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
  const bulletin = notice.bulletin_date ? (
    <span>
      <ExternalLink
        url={`https://www.uvo.gov.sk/evestnik?poradie=${notice.bulletin_number}&year=${
          notice.bulletin_year
        }`}
      >
        {`${notice.bulletin_number}/${notice.bulletin_year}`}
      </ExternalLink>
      <strong>({notice.bulletin_date})</strong>
    </span>
  ) : null

  const estimate =
    notice.price_num >= 5 ? (
      <Fragment>
        <ShowNumberCurrency num={getSuspectLevelLimit(notice, -1)} key="currency-1" />
        {' - '}
        <ShowNumberCurrency num={getSuspectLevelLimit(notice, 1)} key="currency-2" />
      </Fragment>
    ) : null

  const noticeDetailInformations = [
    {
      label: 'Popis',
      body: notice.text,
    },
    {
      label: 'Objednávateľ',
      body: notice.customer,
    },
    {
      label: 'Vestník',
      body: bulletin,
    },
    {
      label: 'Vyhlásená cena',
      body: <ShowNumberCurrency num={notice.price} />,
    },
    {
      label: 'Náš odhad',
      body: estimate,
    },
  ].filter((item) => item.body !== null)

  return (
    <Container tag="article" className="notice-detail">
      <h1 className="notice-detail-title">{notice.title}</h1>
      <NoticeInformation data={noticeDetailInformations} />
      <div className="notice-detail-table">
        <CompaniesTable item={notice} />
      </div>
    </Container>
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
