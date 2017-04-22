import React from 'react';

const TabLink = ({ isMapView, url, text }) =>
  (
    <a href={url} className={isMapView && ('verejne-menu-selected')} target="_blank" rel="noopener noreferrer">
      {text}&nbsp;
      <i className="fa fa-external-link" aria-hidden="true"></i>
    </a>
  );


export default TabLink;
