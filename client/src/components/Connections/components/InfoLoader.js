// @flow
import React from 'react'
import CompanyDetails from './../../shared/CompanyDetails'
import './InfoLoader.css'

type Props = {
  eid: number,
  hasConnectLine?: boolean,
}

const InfoLoader = ({eid, hasConnectLine}: Props) => (
  <div className="info-loader">
    <CompanyDetails eid={eid} useNewApi />
    {hasConnectLine && (
      <div className="container">
        <div className="info-loader-connection-line" />
      </div>
    )}
  </div>
)

export default InfoLoader
