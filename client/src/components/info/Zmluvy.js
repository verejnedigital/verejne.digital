import React from 'react';
import TabLink from './TabLink';
import { showNumber } from '../../utility/utilities';

const Zmluvy = ({ data, isMapView }) =>
(
  <ul>
    {data.map(contract => (
      <li key={contract.source}>
        <TabLink
          isMapView={isMapView}
          url={contract.source}
          text={`${contract.customer}, ${showNumber(contract.total)}`}
        />
      </li>
    ))
    }
  </ul>
);

export default Zmluvy;
