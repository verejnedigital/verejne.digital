import React from 'react'
import ExternalLink from '../ExternalLink'
import {ShowNumberCurrency} from '../../Notices/utilities'
import './InfoList.css'

const SponsorshipsOfParties = ({entityName, data}) => (
  <ul className="contractList list-unstyled">
    {data.map((sponzor) => (
      <li key={sponzor.strana}>
        <ExternalLink
          url={`http://datanest.fair-play.sk/searches/quick?query_string=${entityName}`}
        >
          {`${sponzor.strana} `}
          <ShowNumberCurrency num={sponzor.hodnota_daru} curr={sponzor.rok < 2009 ? 'Sk' : '€'} />
          {` (rok ${sponzor.rok})`}
        </ExternalLink>
      </li>
    ))}
  </ul>
)

export default SponsorshipsOfParties
