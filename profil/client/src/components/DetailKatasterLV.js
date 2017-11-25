
import React from 'react';

import './DetailKatasterLV.css';

const DetailKatasterLV = ({lv}) => (
<tr>
  <td>
    <div>
      <a href="">{lv.landusename}</a>
      <span className="podiel">{`${Number(lv.participantratio).toFixed(2)}% podiel`}</span>
    </div>
    <div>{`${lv.cadastralunitname}, cislo parcely: ${lv.parcelno}; LV c. ${lv.foliono}`}</div>
  </td>
</tr>
);
export default DetailKatasterLV;
