import React from 'react';

const TabLink = ({ isMapView, url, text }) =>
  (
    <a href={url} className={isMapView && ('verejne-menu-selected')} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );


export default TabLink;
