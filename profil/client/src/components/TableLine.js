import React from 'react';

const TableLine = ({politician}) => (
<tr>
  <td>{politician.firstname} {politician.surname}</td>
  <td>{politician.party_nom}</td>
  <td className="numbercolumn">8</td>
  <td className="numbercolumn">24</td>
  <td className="numbercolumn">3</td>
</tr>
);
export default TableLine;