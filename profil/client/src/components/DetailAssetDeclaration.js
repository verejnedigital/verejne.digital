import React from 'react';
import './DetailAssetDeclaration.css';


const DetailAssetDeclaration = ({assets, year}) => (
<table className="assets-declaration table">
  <thead>
    <tr>
      <th></th>
      <th>
        Majetkové priznanie ({assets.length})
        <span className="assets-declaration source">zdroj </span>
        <a href="http://www.nrsr.sk">NRSR <i className="fa fa-external-link" aria-hidden="true"></i></a>
      </th>
    </tr>
    <tr>
      <td colspan="2" className="year_navigation">
      &larr; rok {year} &rarr;
      </td>
    </tr>
  </thead>
  <tbody>
    {assets.map((asset, key) =>
      <tr key={key}>
        <td className="key">{key < 9 ? "0" + (key + 1) : (key + 1)}</td>
        <td>
          {asset}
        </td>
      </tr>
    )}    
  </tbody>
</table>
);
export default DetailAssetDeclaration;