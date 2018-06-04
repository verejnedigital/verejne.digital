import React from 'react'
import {compose, branch, renderNothing} from 'recompose'

const _NoticeInformation = ({data}) => {
  if (data === null || data.length === 0) {
    return null
  }

  return (
    <table className="dataTable table table-responsive">
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>
              <div className="media">
                <div className="mx-2">{item.label}</div>
                <div className="media-body">{item.body}</div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default compose(
  branch((props) => props.data === null || props.data.length === 0, renderNothing)
)(_NoticeInformation)
