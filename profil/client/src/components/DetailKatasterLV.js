
import React from 'react';

import './DetailKatasterLV.css';

const DetailKatasterLV = ({num, lv}) => (
<tr>
  <td className="key">{num < 10 ? "0" + num : num}
  </td>
  <td>
    <div>
      <a target="_BLANK" href={"https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?prfNumber=" + lv.foliono + "&cadastralUnitCode=" + lv.cadastralunitcode + "&outputType=html"}>{lv.landusename}
      &nbsp;<i class="fa fa-external-link" aria-hidden="true"></i></a>
      <span className="podiel">{`${Number(lv.participantratio).toFixed(2)}% podiel`}</span>
    </div>
    <div>{`${lv.cadastralunitname}, číslo parcely: ${lv.parcelno}; LV č. ${lv.foliono}`}</div>
  </td>
</tr>
);
export default DetailKatasterLV;
