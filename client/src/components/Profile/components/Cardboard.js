// @flow
import React, {Fragment} from 'react'
import {getTerm} from '../utilities'

import type {PoliticianDetail} from '../../../state'

import './Cardboard.css'

type CardboardProps = {
  politician: PoliticianDetail,
}

const Cardboard = ({politician}: CardboardProps) => (
  <div className="profile-cardboard">
    <img className="picture" src={politician.picture || '/politician_default.png'} alt="profilephoto" />
    <div>
      <h3 className="name">
        {politician.firstname} {politician.surname}{politician.title && `, ${politician.title}`}
      </h3>
      <dl className="row">
        <dt className="col-md-1 col-sm-0">Funkcia</dt>
        <dd className="col-md-11 col-sm-12">
          {politician.surname.endsWith('ová')
            ? politician.office_name_female
            : politician.office_name_male
          }{getTerm(politician) && `, ${getTerm(politician)}`}
        </dd>

        {politician.party_nom &&
          <Fragment>
            <dt className="col-md-1 col-sm-0">Strana</dt>
            <dd className="col-md-11 col-sm-12">{politician.party_nom}</dd>
          </Fragment>
        }
      </dl>
    </div>
  </div>
)

export default Cardboard
