import React from 'react';
import DetailKatasterLV from './DetailKatasterLV';
import './DetailKatasterTable.css';


const DetailKatasterTable = ({kataster}) => (
<table className="kataster table">
  <thead>
    <tr>
      <th>Udaje z Katastra ({kataster.length})</th>
    </tr>
  </thead>
  <tbody>
    {kataster.map(lv =>
      <DetailKatasterLV key={lv.foliono}  lv={lv}/>,
    )}
  </tbody>
</table>
);
export default DetailKatasterTable;