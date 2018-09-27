// @flow
import React from 'react'
import type {Node} from 'react'
import {branch, renderNothing} from 'recompose'
import './NoticeInformation.css'

type Props = {|
  data: Array<{body: string | Node, label: string}>,
|}

const _NoticeInformation = ({data}: Props) => (
  <ul className="notice-information">
    {data.map(({label, body}, index) => (
      <li className="notice-information-item" key={index}>
        {label && <strong>{label}:</strong>} {body}
      </li>
    ))}
  </ul>
)

export default branch(({data}: Props) => data === null || data.length === 0, renderNothing)(
  _NoticeInformation
)
