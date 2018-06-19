import React from 'react'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../Notices/utilities'
import './InfoList.css'

const DonationsToParties = ({entityName, data}) => (
  <ul className="contractList list-unstyled">
    {data.map((sponzor) => (
      <li key={sponzor.strana}>
        <ExternalLink
          url={`http://datanest.fair-play.sk/searches/quick?query_string=${entityName}`}
        >
          {`${sponzor.strana}, `}
          <ShowNumberCurrency num={sponzor.vyska_prispevku} curr={sponzor.mena} />
          {` (rok ${sponzor.rok})`}
        </ExternalLink>
      </li>
    ))}
  </ul>
)

export default DonationsToParties
