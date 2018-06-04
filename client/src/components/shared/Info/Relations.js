import React from 'react'
import RecursiveInfo from './RecursiveInfo'
import './InfoList.css'

const Relations = ({data}) => (
  <ul className="contractList list-unstyled">
    {data.map((related) => (
      <li key={related.eid}>
        <RecursiveInfo name={related.name} eid={related.eid} />
      </li>
    ))}
  </ul>
)

export default Relations
