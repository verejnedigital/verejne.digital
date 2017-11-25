import React from 'react';
import './DetailAssetDeclaration.css';


const DetailAssetDeclaration = ({assets}) => (
<table className="assets-declaration table">
  <thead>
    <tr>
      <th>Majetkove priznania ({assets.length})</th>
    </tr>
  </thead>
  <tbody>
    {assets.map((asset, key) =>
      <tr key={key}>
        <td>
          {asset}
        </td>
      </tr>
    )}
  </tbody>
</table>
);
export default DetailAssetDeclaration;