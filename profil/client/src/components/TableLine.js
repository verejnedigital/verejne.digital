import React from 'react';

const TableLine = ({politician}) => (
<tr>
  <td>{politician.firstname} {politician.surname}</td>
  <td className="party-column">{politician.party_nom}</td>
  <td className="number-column">8</td>
  <td className="number-column">24</td>
  <td className="number-column">3</td>
</tr>
);
export default TableLine;