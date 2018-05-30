import React from 'react'

export default ({data}) => {
  if (data === null || data.length === 0) {
    return null
  }

  const rows = data.map((item, index) => (
    <tr key={index}>
      <td>
        <div className="media">
          <div className="mx-2">{item.label}</div>
          <div className="media-body">{item.body}</div>
        </div>
      </td>
    </tr>
  ))

  return (
    <table className="dataTable table table-responsive">
      <tbody>{rows}</tbody>
    </table>
  )
}
