// @flow
import React, {Fragment} from 'react'
import {getTerm, mergeConsecutiveTerms} from '../utilities'

import type {PoliticianDetail} from '../../../state'

import './Cardboard.css'

type CardboardProps = {
  politician: PoliticianDetail,
}

const Cardboard = ({politician}: CardboardProps) => (
  <div className="profile-cardboard">
    <img
      className="picture"
      src={politician.picture || '/politician_default.png'}
      alt="profilephoto"
    />
    <div>
      <h3 className="name">
        {politician.firstname} {politician.surname}
        {politician.title && `, ${politician.title}`}
      </h3>
      {politician.offices &&
        mergeConsecutiveTerms(politician.offices).map((office, i) => (
          <dl className="row" key={i}>
            <dt className="col-md-1 col-sm-0">Funkcia</dt>
            <dd className="col-md-11 col-sm-12">
              {politician.surname.endsWith('ová')
                ? office.office_name_female
                : office.office_name_male}
              {getTerm(office) && `, ${getTerm(office)}`}
            </dd>

            {office.party_nom && (
              <Fragment>
                <dt className="col-md-1 col-sm-0">Strana</dt>
                <dd className="col-md-11 col-sm-12">{office.party_nom}</dd>
              </Fragment>
            )}
          </dl>
        ))}
    </div>
  </div>
)

export default Cardboard
