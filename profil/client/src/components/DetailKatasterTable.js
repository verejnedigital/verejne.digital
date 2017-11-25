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
      <DetailKatasterLV key={lv.parcelno}  lv={lv}/>,
    )}
  </tbody>
</table>
);
export default DetailKatasterTable;


// area
// :
// 90
// cadastralunitcode
// :
// 819000
// cadastralunitname
// :
// "Hradište pod Vrátnom"
// foliono
// :
// 760
// folioownerscount
// :
// 1
// landusename
// :
// "Záhrada"
// legalrighttexts
// :
// []
// parcelno
// :
// "483/2"
// parceltype
// :
// "C"
// participantratio
// :
// 100
// participanttypename
// :
// "Vlastník"
// utilisationname
// :
// "Pozemok prevažne v zastavanom území obce alebo v záhradkárskej osade, na ktorom sa pestuje zelenina, ovocie, okrasná nízka a vysoká zeleň a iné poľnohospodárske plodiny"
// __proto__
// :
