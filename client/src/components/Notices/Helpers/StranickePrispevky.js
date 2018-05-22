import React from 'react'
import TabLink from './ExternalLink'
import {showNumberCurrency} from '../utilities'

const StranickePrispevky = ({entityName, data}) => (
  <ul className="sponzorList">
    {data.map((sponzor) => (
      <li key={sponzor.strana}>
        <TabLink
          isMapView={false}
          url={`http://datanest.fair-play.sk/searches/quick?query_string=${entityName}`}
          text={[sponzor.strana, ', ', showNumberCurrency(sponzor.vyska_prispevku, sponzor.mena), ` (rok ${sponzor.rok})`]}
        />
      </li>
    ))
    }
  </ul>
)

export default StranickePrispevky
