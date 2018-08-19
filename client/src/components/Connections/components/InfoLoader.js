// @flow
import React from 'react'
import CompanyDetails from './../../shared/CompanyDetails'
import './InfoLoader.css'

type Props = {
  eid: string,
  hasConnectLine?: boolean,
}

const InfoLoader = ({eid, hasConnectLine}: Props) => (
  <div className="info-loader">
    <CompanyDetails eid={eid} />
    {hasConnectLine && (
      <div className="container">
        <div className="info-loader-connection-line" />
      </div>
    )}
  </div>
)

export default InfoLoader
