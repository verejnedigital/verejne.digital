
import React from 'react';

const DetailKatasterLV = ({lv}) => (
<tr>
  <td>
    <div>{`${lv.landusename} ${Number(lv.participantratio).toFixed(2)}% podiel`}</div>
    <div>{`${lv.cadastralunitname}, cislo parcely: ${lv.parcelno}; LV c. ${lv.foliono}`}</div>
  </td>
</tr>
);
export default DetailKatasterLV;
