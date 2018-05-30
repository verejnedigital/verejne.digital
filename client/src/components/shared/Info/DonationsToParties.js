import React from 'react'
import ExternalLink from '../ExternalLink'
import {showNumberCurrency} from '../../Notices/utilities'
import './InfoList.css'

export default ({entityName, data}) => (
  <ul className="contractList list-unstyled">
    {data.map((sponzor) => (
      <li key={sponzor.strana}>
        <ExternalLink
          url={`http://datanest.fair-play.sk/searches/quick?query_string=${entityName}`}
          text={[
            sponzor.strana,
            ', ',
            showNumberCurrency(sponzor.vyska_prispevku, sponzor.mena),
            ` (rok ${sponzor.rok})`,
          ]}
        />
      </li>
    ))}
  </ul>
)
