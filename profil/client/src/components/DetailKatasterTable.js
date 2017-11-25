import React from 'react';
import DetailKatasterLV from './DetailKatasterLV';
import './DetailKatasterTable.css';


const DetailKatasterTable = ({kataster}) => (
<table className="kataster table">
  <thead>
    <tr>
      <th></th>
      <th>Údaje z Katastra ({kataster.length})</th>
    </tr>
  </thead>
  <tbody>
    {kataster.map((lv, key) =>
      <DetailKatasterLV key={key} num={key+1} lv={lv}/>,
    )}
  </tbody>
</table>
);
export default DetailKatasterTable;