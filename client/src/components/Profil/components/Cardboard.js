// @flow
import React from 'react'
import './Cardboard.css'

import type {PoliticianDetail} from '../../../state/index'

type CardboardProps = {
  politician: PoliticianDetail,
}

const Cardboard = ({politician}: CardboardProps) => (
  <div className="profile-cardboard">
    <div>
      <h3 className="name">
        {politician.firstname} {politician.surname}, {politician.title}
      </h3>
      <dl className="row">
        <dt className="col-md-1 col-sm-2">Funkcia</dt>
        <dd className="col-md-11 col-sm-10">
          {politician.office_name_male}, {politician.term_start} - {politician.term_finish}
        </dd>

        <dt className="col-md-1 col-sm-2">Strana</dt>
        <dd className="col-md-11 col-sm-10">{politician.party_nom}</dd>
      </dl>
    </div>
    <img className="picture" src={politician.picture} alt="profilephoto" />
  </div>
)

export default Cardboard
