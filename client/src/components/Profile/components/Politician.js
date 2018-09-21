import React from 'react'
import {withHandlers} from 'recompose'
import {NavLink} from 'react-router-dom'
import {getTerm} from '../utilities'

const Politician = ({politician, useDefaultPicture}) => (
  <tr className="table-line">
    <td className="number-column">{politician.order}.</td>
    <td>
      <img
        alt="foto"
        className="thumb-photo"
        src={`https://verejne.digital/img/nrsr/${politician.surname}_${politician.firstname}.jpg`}
        onError={useDefaultPicture}
      />
    </td>
    <td className="text-left">
      <NavLink to={`/profil/${politician.id}`}>
        {politician.firstname} {politician.surname}
      </NavLink>
    </td>
    <td className="text-left party-column">
      {(!politician.term_start) && '\t'}{getTerm(politician)}
    </td>
    <td className="party-column">{politician.party_abbreviation}</td>
    <td className="number-column">{politician.num_houses_flats}</td>
    <td className="number-column">{politician.num_fields_gardens}</td>
    <td className="number-column">{politician.num_others}</td>
  </tr>
)

export default withHandlers({
  useDefaultPicture: () => (e) => {
    e.target.src = '/politician_default_s.png'
  },
})(Politician)
