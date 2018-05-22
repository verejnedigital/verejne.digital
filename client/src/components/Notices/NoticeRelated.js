import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {noticeRelatedProvider} from '../../dataProviders/noticesDataProviders'
import {noticeRelatedSelector} from '../../selectors'
import Info from './Helpers/Info'
import './NoticeRelated.css'
import LoadingBanner from './Helpers/LoadingBanner'

import type {Related, State} from '../../state'

export type NoticeRelatedProps = {
  related: Related,
  match: {
    params: {
      eid: string,
    },
  },
}

const NoticeRelated = ({related}: NoticeRelatedProps) => {
  console.log(related)
  return (
    <span>natahane</span>
  )
}


export default compose(
  withDataProviders((props: NoticeRelatedProps) => {
    return [noticeRelatedProvider(props.eid)] //props.match neexistuje, neviem preco
  }),
  connect((state: State, props: NoticeRelatedProps) => ({
    related: noticeRelatedSelector(state, props),
  }))
)(NoticeRelated)
