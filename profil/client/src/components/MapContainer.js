import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import './MapContainer.css';

export class MapContainer extends Component { 
render() {
    return (
      <Map google={this.props.google} zoom={7} style={{width: '800px', height: '360px', position: 'absolute'}} className="detailMap"
      center={{lat: 48.6, lng: 19.5}}>       
      {console.log('Markers: ' + this.props.assets.length)}     
      {console.log(this.props.assets[0])}
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