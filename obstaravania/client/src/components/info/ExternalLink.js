import React from 'react';

const ExternalLink = ({ isMapView, url, text }) =>
  (
    <a href={url} className={isMapView && ('verejne-menu-selected')} target="_blank" rel="noopener noreferrer">
      {text}&nbsp;
      <i className="fa fa-external-link" aria-hidden="true" />
    </a>
  );

export default ExternalLink;
