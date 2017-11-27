import React from 'react';

const TableLine = ({politician}) => (
<tr>
  <td><img alt="profile" className="thumb-photo" src="http://www.nrsr.sk/web/dynamic/PoslanecPhoto.aspx?PoslanecID=1&amp;ImageWidth=140"/></td>  
  <td><a href={`detail/${politician.id}`}>{politician.firstname} {politician.surname}</a></td>
  <td className="party-column">{politician.party_abbreviation}</td>
  <td className="number-column">{politician.num_houses_flats}</td>
  <td className="number-column">{politician.num_fields_gardens}</td>
  <td className="number-column">{politician.num_others}</td>
</tr>
);
export default TableLine;