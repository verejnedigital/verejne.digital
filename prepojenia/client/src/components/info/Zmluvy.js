import React from 'react';
import TabLink from './TabLink';
import { showNumberCurrency } from '../../utility/utilities';
import './Zmluvy.css';

const Zmluvy = ({ data, isMapView }) =>
(
  <ul className="contractList list-unstyled">
    {data.map(contract => (
      <li key={contract.source}>
        <TabLink
          isMapView={isMapView}
          url={contract.source}
          text={`${contract.customer}, ${showNumberCurrency(contract.total)}`}
        />
      </li>
    ))
    }
  </ul>
);

export default Zmluvy;
