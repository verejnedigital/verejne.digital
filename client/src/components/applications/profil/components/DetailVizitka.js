import React from 'react'
import './DetailVizitka.css'

const DetailVizitka = ({politician}) => (
  <div className="vizitka">
    <div className="vizitka-info">
      <h3 className="name">{politician.firstname} {politician.surname}, {politician.title}</h3>
      <br />
      <div><span className="bolder">Funkcia:</span> {politician.office_name_male}, {politician.term_start} - {politician.term_finish}</div>
      <div><span className="bolder">Strana:</span> {politician.party_nom}</div>
    </div>
    <img className="vizitka-picture" src={politician.picture} alt="profilephoto" />
  </div>
)

export default DetailVizitka
