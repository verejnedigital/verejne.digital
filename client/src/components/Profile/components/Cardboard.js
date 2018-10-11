// @flow
import React, {Fragment} from 'react'
import {withProps} from 'recompose'
import {getTerm, mergeConsecutiveTerms, splitOfficesByYear} from '../utilities'

import type {PoliticianDetail, PoliticianOffice} from '../../../state'

import './Cardboard.css'

type CardboardProps = {
  politician: PoliticianDetail,
}

type DerivedProps = {
  currentOffices: Array<PoliticianOffice>,
  pastOffices: Array<PoliticianOffice>,
}

const Cardboard = ({politician, currentOffices, pastOffices}: CardboardProps & DerivedProps) => (
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
      {currentOffices.length > 0 && currentOffices.map((office, i) => (
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
      {pastOffices.length > 0 &&
        <dl className="row" key="past">
          <dt className="col-md-1 col-sm-0">Minulé funkcie</dt>
          <dd className="col-md-11 col-sm-12">
            {pastOffices.map((office, i) => (
              <div key={i}>
                {politician.surname.endsWith('ová')
                  ? office.office_name_female
                  : office.office_name_male}
                {getTerm(office) && `, ${getTerm(office)}`}
                {office.party_abbreviation &&
                  <span title={office.party_nom}>{`, ${office.party_abbreviation}`}</span>}
              </div>
            ))}
          </dd>
        </dl>
      }
    </div>
  </div>
)

export default withProps((props: CardboardProps) => {
  const mergedOffices = mergeConsecutiveTerms(props.politician.offices)
  const splitOffices = splitOfficesByYear(mergedOffices, new Date().getFullYear())
  return {
    ...props,
    currentOffices: splitOffices.current,
    pastOffices: splitOffices.past,
  }
})(Cardboard)
