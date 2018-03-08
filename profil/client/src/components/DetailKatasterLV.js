
import React from 'react';

import './DetailKatasterLV.css';

const DetailKatasterLV = ({num, lv, onParcelShow}) => (
<tr onClick={onParcelShow} className="parcel">
  <td className="key">{num < 10 ? "0" + num : num}
  </td>
  <td>
    <div>
      <a target="_BLANK" href={"https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?prfNumber=" + lv.foliono + "&cadastralUnitCode=" + lv.cadastralunitcode + "&outputType=html"}>{lv.landusename}
      &nbsp;<i className="fa fa-external-link" aria-hidden="true"/></a>
    </div>
    <div>{`${lv.cadastralunitname}, LV č. ${lv.foliono}; parcely: ${lv.parcelno}`}</div>
  </td>
</tr>
);
export default DetailKatasterLV;
