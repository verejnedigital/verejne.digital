import React from 'react'
import {branch, renderNothing} from 'recompose'
import './NoticeInformation.css'

type Props = {|
  data: Array<{body: string, label:string}>,
|}

const _NoticeInformation = ({data}: Props) => (
  <ul className="notice-information">
    {data.map(({label, body}, index) => (
      <li className="notice-information-item" key={index}>
        <strong>{label}:</strong> {body}
      </li>
    ))}
  </ul>
)

export default branch((props) => props.data === null || props.data.length === 0, renderNothing)(
  _NoticeInformation
)
