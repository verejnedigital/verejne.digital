import React from 'react';

// For map view, we do not give red/green colors
const ShowTrend = ({ isMapView, trend }) => {
  const style = {};
  if (!isMapView) {
    style.color = trend >= 0 ? 'green' : 'red';
  }
  return (
    <span title="Oproti predchádzajúcemu roku" style={style} >
      {`${trend > 0 ? '+' : ''}${trend}%`}
    </span>
  );
};

export default ShowTrend;
