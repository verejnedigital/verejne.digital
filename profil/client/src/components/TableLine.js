import React from 'react';

const TableLine = ({politician}) => (
<tr>
  <td><a href={`detail/${politician.id}`}>{politician.firstname} {politician.surname}</a></td>
  <td className="party-column">{politician.party_nom}</td>
  <td className="number-column">8</td>
  <td className="number-column">24</td>
  <td className="number-column">3</td>
</tr>
);
export default TableLine;