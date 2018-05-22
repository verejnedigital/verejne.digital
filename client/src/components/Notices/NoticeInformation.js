import React from 'react'

const NoticeInformation = ({data}) => {
  if (data === null || data.length === 0) {
    return null
  }

  const rows = data.map((item, index) => (
    <tr key={index}>
      <td>
        <div className="media">
          <div className="media-left">
            {item.label}
          </div>
          <div className="media-body">
            {item.body}
          </div>
        </div>
      </td>
    </tr>
  ))

  return (
    <table className="dataTable table table-responsive">
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}

export default NoticeInformation
