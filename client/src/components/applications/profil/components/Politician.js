import React from 'react'
import {NavLink} from 'react-router-dom'

const Politician = ({politician}) => (
  <tr className="table-line">
    <td className="number-column">{politician.order}.</td>
    <td>
      <img
        alt="foto"
        className="thumb-photo"
        src={`https://verejne.digital/img/nrsr/${politician.surname}_${politician.firstname}.jpg`}
      />
    </td>
    <td className="text-left">
      <NavLink to={`/profil/${politician.id}`}>
        {politician.firstname} {politician.surname}
      </NavLink>
    </td>
    <td className="text-left party-column">
      {politician.term_start} - {politician.term_finish}
    </td>
    <td className="party-column">{politician.party_abbreviation}</td>
    <td className="number-column">{politician.num_houses_flats}</td>
    <td className="number-column">{politician.num_fields_gardens}</td>
    <td className="number-column">{politician.num_others}</td>
  </tr>
)

export default Politician
