import React from 'react';

const Vztahy = ({ data }) =>
(
  <ul>
    {data.map(related => (
      <li key={related.eid}>
        {related.name}
      </li>
    ))
    }
  </ul>
);


export default Vztahy;
