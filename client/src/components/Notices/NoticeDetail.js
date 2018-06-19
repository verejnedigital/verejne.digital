// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeDetailProvider} from '../../dataProviders/noticesDataProviders'
import {noticeDetailSelector} from '../../selectors'
import ExternalLink from '../shared/ExternalLink'
import {getSuspectLevelLimit, ShowNumberCurrency} from './utilities'
import CompaniesTable from './CompaniesTable'
import './NoticeDetail.css'
import NoticeInformation from './NoticeInformation'
import {Container, Row, Col} from 'reactstrap'

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
      <span className="note">({notice.bulletin_date})</span>
    </span>
  ) : null

  const estimate =
    notice.price_num >= 5
      ? [
        <ShowNumberCurrency num={getSuspectLevelLimit(notice, -1)} key="currency-1" />,
        ' - ',
        <ShowNumberCurrency num={getSuspectLevelLimit(notice, 1)} key="currency-2" />,
      ]
      : null

  const noticeDetailInformations = [
    {
      label: <span className="my-label">Popis:</span>,
      body: notice.text,
    },
    {
      label: <span className="my-label">Objednávateľ:</span>,
      body: notice.customer,
    },
    {
      label: <span className="my-label">Vestník:</span>,
      body: bulletin,
    },
    {
      label: <span className="my-label">Vyhlásená cena:</span>,
      body: <ShowNumberCurrency num={notice.price} />,
    },
    {
      label: <span className="my-label">Náš odhad:</span>,
      body: estimate,
    },
  ]

  return (
    <Container tag="article" className="container-fluid notice-detail">
      <Row>
        <Col className="col-sm-12 col-xs-12">
          <h3 className="title">{notice.title}</h3>
        </Col>
      </Row>
      <Row>
        <Col tag="section" className="col-sm-12 col-xs-12">
          <NoticeInformation data={noticeDetailInformations.filter((o) => o.body !== null)} />
        </Col>
      </Row>
      <Row>
        <Col tag="section" className="col-sm-12 col-xs-12">
          <CompaniesTable item={notice} />
        </Col>
      </Row>
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
