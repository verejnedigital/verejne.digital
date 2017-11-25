import React from 'react';
import './DetailVizitka.css';

const DetailVizitka = ({politician}) => (
<div>
  <h2>{politician.firstname} {politician.surname}</h2>
  <div>Strana: {politician.party_nom}</div>
  <img className="vizitka-picture" src={politician.picture} alt="profilephoto"></img>
</div>
);
export default DetailVizitka;


