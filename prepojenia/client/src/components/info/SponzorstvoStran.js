import React from 'react';
import TabLink from './TabLink';
import { showNumberCurrency } from '../../utility/utilities';

const SponzorstvoStran = ({ entityName, data }) => (
  <ul className="sponzorList">
    {data.map(sponzor => (
      <li key={sponzor.strana}>
        <TabLink
          isMapView={false}
          url={`http://datanest.fair-play.sk/searches/quick?query_string=${entityName}`}
          text={`${sponzor.strana}, ${showNumberCurrency(sponzor.hodnota_daru, (sponzor.rok < 2009 ? 'Sk' : '€'))} (rok ${sponzor.rok})`}
        />
      </li>
    ))
    }
  </ul>
);


export default SponzorstvoStran;
