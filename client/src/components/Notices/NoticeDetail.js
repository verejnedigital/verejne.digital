// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeDetailProvider} from '../../dataProviders/noticesDataProviders'
import {noticeDetailSelector} from '../../selectors'

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
  return (
    <div>
      <div>{notice.title}</div>
      <div>{notice.text}</div>
      {notice.kandidati.map((n) => (Array.isArray(n) ? '' : <div key={n.id}>{n.customer}</div>))}
    </div>
  )
}

export default compose(
  withDataProviders((props: NoticeDetailProps) => [noticeDetailProvider(props.match.params.id)]),
  connect((state: State, props: NoticeDetailProps) => ({
    notice: noticeDetailSelector(state, props),
  }))
)(NoticeDetail)
