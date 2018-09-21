// @flow
import React, {Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeDetailProvider} from '../../dataProviders/noticesDataProviders'
import {noticeDetailSelector} from '../../selectors'
import ExternalLink from '../shared/ExternalLink'
import {getWarning} from './utilities'
import {ShowNumberCurrency} from '../../services/utilities'
import CompaniesTable from './CompaniesTable'
import CompanyDetails from '../shared/CompanyDetails'
import './NoticeDetail.css'
import NoticeInformation from './NoticeInformation'
import {Container} from 'reactstrap'

import type {NoticeDetail, State} from '../../state'

export type NoticeDetailProps = {
  notice: NoticeDetail,
  match: {
    params: {
      id: string,
    },
  },
}

const _NoticeDetail = ({notice}: NoticeDetailProps) => {
  const bulletin = notice.bulletin_published_on ? (
    <span>
      <ExternalLink
        url={`https://www.uvo.gov.sk/evestnik?poradie=${notice.bulletin_number}&year=${
          notice.bulletin_year
        }`}
      >
        {`${notice.bulletin_number}/${notice.bulletin_year}`}
      </ExternalLink>
      <strong>({notice.bulletin_published_on})</strong>
    </span>
  ) : null

  const estimate = notice.price_est_low ? (
    <Fragment>
      <ShowNumberCurrency num={notice.price_est_low} key="currency-1" />
      {' - '}
      <ShowNumberCurrency num={notice.price_est_high} key="currency-2" />
    </Fragment>
  ) : null

  const noticeDetailInformations = [
    {
      label: 'Popis',
      body: notice.body,
    },
    {
      label: 'Objednávateľ',
      body: notice.name,
    },
    {
      label: 'Vestník',
      body: bulletin,
    },
    {
      label: notice.total_final_value_amount ? 'Konečná cena' : 'Vyhlásená cena',
      body: (
        <Fragment>
          <ShowNumberCurrency
            num={notice.total_final_value_amount || notice.estimated_value_amount}
          />{' '}
          {getWarning(notice)}
        </Fragment>
      ),
    },
    {
      label: 'Náš odhad',
      body: estimate,
    },
    {
      label: 'Výherca',
      body: notice.supplier_name,
    },
  ].filter((item) => item.body !== null)

  return (
    <Container tag="article" className="notice-detail">
      <h1 className="notice-detail-title">{notice.title}</h1>
      <NoticeInformation data={noticeDetailInformations} />
      {notice.supplier_name ? (
        <div className="notice-detail-table">
          <CompanyDetails eid={notice.supplier_eid} />
        </div>
      ) : (
        <div className="notice-detail-table">
          <CompaniesTable item={notice} />
        </div>
      )}
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
)(_NoticeDetail)
