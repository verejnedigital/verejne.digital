import React from 'react';
import DetailKatasterLV from './DetailKatasterLV';

const DetailKatasterTable = ({kataster}) => (
<table className="table">
  <thead>
    <tr>
      <th>Udaje z Katastra</th>
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