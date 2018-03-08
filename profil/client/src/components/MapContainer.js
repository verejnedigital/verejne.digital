import React, { Component } from 'react';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';
import './MapContainer.css';

export class MapContainer extends Component {
    mapStyles = [
        {elementType: 'geometry.fill', stylers: [{color: '#f1f4f5'}]},
        {elementType: 'geometry.stroke', stylers: [{color: '#cddae3'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#666666'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#ffffff'}]},
        {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{color: '#333333'}]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry.stroke',
            stylers: [{color: '#859fb4'}]
        },
        {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [{color: '#f1f4f5'}]
        },
        {
            featureType: 'landscape.man_made',
            elementType: 'geometry.fill',
            stylers: [{color: '#dae3ea'}]
        },
        {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{color: '#ffffff'}]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#a5baca'}]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [{color: '#ffffff'}]
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{color: '#c5d1da'}]
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{color: '#e6ecf1'}]
        },
        {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{color: '#ebf8ff'}]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#859fb4'}]
        },
        {
            featureType: 'landscape.natural',
            elementType: 'labels',
            stylers: [{visibility: 'off'}]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [{visibility: 'off'}]
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels',
            stylers: [{visibility: 'off'}]
        }
    ];

  static defaultProps = {
    center: {lat: 48.6, lng: 19.5}
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.google !== this.props.google) {
      return true;
    }

    if (this.props.assets !== nextProps.assets) {
      this.zoom = 7;
      this.markers = [];
      return true;
    }

    if (this.props.center !== nextProps.center) {
      this.zoom = 18;
      return true;
    }

    return false;
  }

  //reference cache to avoid map markers re-rendering
  markers = [];
  zoom = 7;

  render() {
    let icon = {
        path : this.props.google === undefined ? null : this.props.google.maps.SymbolPath.CIRCLE,
        scale : 12,
        strokeColor : '#0062db',
        strokeWeight : 2.0,
        fillColor : 'white',
        fillOpacity : 0.75
    };

    if (this.markers.length !== this.props.assets.length) {
        this.markers = this.props.assets.map((asset, key) =>
            <Marker
                key={key}
                title={asset.landusename}
                label={{
                    text: '' + (key+1),
                    color: '#337ab7',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}
                icon={icon}
                position={{lat: asset.lat, lng: asset.lon}} />
        );
    }

    return (
      <Map
        google={this.props.google}
        zoom={this.zoom}
        style={{height: '360px', position: 'relative'}}
        className="detailMap"
        center={{lat: this.props.center.lat, lng: this.props.center.lng}} //Do not use direct reference (!)
        styles={this.mapStyles}
      >
      {this.markers}
      </Map>
    );
  }
}
 
export default GoogleApiWrapper({
  apiKey: ("AIzaSyCAXMlEL-sfzT4jVK5CQHysSPp77JnVLks")
})(MapContainer)