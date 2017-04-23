import React from 'react';
import RecursiveInfo from './RecursiveInfo';

const Vztahy = ({ data }) =>
(
  <ul className="relatedList list-unstyled">
    {data.map(related => (
      <li key={related.eid}>
        <RecursiveInfo name={related.name} eid={related.eid} />
      </li>
    ))
    }
  </ul>
);


export default Vztahy;
