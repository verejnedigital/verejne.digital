import React, { Component } from 'react';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';
import './MapContainer.css';

export class MapContainer extends Component { 
render() {
    return (
      <Map google={this.props.google} zoom={7} style={{height: '360px', position: 'relative'}} className="detailMap"
      center={{lat: 48.6, lng: 19.5}}>             
      {this.props.assets.map((asset, key) =>        
        <Marker
          key={key}          
          title={asset.landusename}          
          label={''+(key+1)}
          position={{lat: asset.lat, lng: asset.lon}} />          
      )}      
      </Map>
    );
  }
}
 
export default GoogleApiWrapper({
  apiKey: ("AIzaSyCAXMlEL-sfzT4jVK5CQHysSPp77JnVLks")
})(MapContainer)