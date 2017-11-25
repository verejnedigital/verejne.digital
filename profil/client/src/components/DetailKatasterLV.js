
import React from 'react';

import './DetailKatasterLV.css';

const DetailKatasterLV = ({num, lv}) => (
<tr>
  <td>{num}
  </td>
  <td>
    <div>
      <a href="">{lv.landusename}</a>
      <span className="podiel">{`${Number(lv.participantratio).toFixed(2)}% podiel`}</span>
    </div>
    <div>{`${lv.cadastralunitname}, číslo parcely: ${lv.parcelno}; LV č. ${lv.foliono}`}</div>
  </td>
</tr>
);
export default DetailKatasterLV;
