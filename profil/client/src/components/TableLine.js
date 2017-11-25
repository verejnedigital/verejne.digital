import React from 'react';

const TableLine = ({politician}) => (
<tr>
  <td><img alt="profile" className="thumb-photo" src="http://www.nrsr.sk/web/dynamic/PoslanecPhoto.aspx?PoslanecID=1&amp;ImageWidth=140"/></td>  
  <td><a href={`detail/${politician.id}`}>{politician.firstname} {politician.surname}</a></td>
  <td className="party-column">{politician.party_abbreviation}</td>
  <td className="number-column">8</td>
  <td className="number-column">24</td>
  <td className="number-column">3</td>
</tr>
);
export default TableLine;