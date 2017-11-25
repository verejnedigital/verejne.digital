import React from 'react';
import './DetailAssetDeclaration.css';


const DetailAssetDeclaration = ({assets}) => (
<table className="assets-declaration table">
  <thead>
    <tr>
      <th></th>
      <th>
        Majetkové priznanie ({assets.length})
        <span className="assets-declaration source"> &nbsp; &nbsp; &nbsp; &nbsp;zdroj <a href="http://www.nrsr.sk">NRSR <i class="fa fa-external-link" aria-hidden="true"></i></a></span>
      </th>
    </tr>
  </thead>
  <tbody>
    {assets.map((asset, key) =>
      <tr key={key}>
        <td>{key + 1}</td>
        <td>
          {asset}
        </td>
      </tr>
    )}
  </tbody>
</table>
);
export default DetailAssetDeclaration;