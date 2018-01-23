import React, { Component } from 'react';
import './DetailPage.css';

import * as serverAPI from './actions/serverAPI';
import DetailVizitka from './components/DetailVizitka';
import DetailKatasterTable from './components/DetailKatasterTable';
import DetailAssetDeclaration from './components/DetailAssetDeclaration';
import MapContainer from './components/MapContainer';

class DetailPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      politician: {},
      kataster: [],
      katasterAssetsFromDeclaration: [],
      hnutelnyAssetsFromDeclaration: [],
      prijmyAssetsFromDeclaration: [],
      report: [],
      index: 0,      
    };
  }

  componentWillMount() {
    // console.log(this.props.id);
    const id = this.props.id;
    this.loadPoliticiant(id);
    this.loadKataster(id);
    this.loadAssetDeclaration(id);    
  }

  loadPoliticiant(id) {
    serverAPI.loadPoliticiant(id,
      (politician) => {
        this.setState({
          politician
        });
      });
  }

  loadKataster(id) {
    serverAPI.katasterInfo(id,
      (kataster) => {        
        this.setState({
          kataster
        });
      });
  }

  split_assets(obj, split_str) {
    if (obj !== undefined && obj[split_str] !== undefined) {
      return obj[split_str].split('\n');
    } else {
      return [];
    }
  }

  loadAssetDeclaration(id) {
    serverAPI.loadAssetDeclaration(id,
      (report) => {
        // Report contains asset declarations for several years.
        // TODO: Make sure it is sorted by year from the most recent to the oldest
        const katasterAssetsFromDeclaration = this.split_assets(report[0], "unmovable_assets");
        const hnutelnyAssetsFromDeclaration = this.split_assets(report[0], "movable_assets");
        var prijmyAssetsFromDeclaration = [];        
        if (report[0] !== undefined) {
          var keys = ["income", "compensations", "other_income", "offices_other"]
          var descriptions = ["príjmy ", "paušálne náhrady", "ostatné príjmy", "počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004)"];
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            prijmyAssetsFromDeclaration.push(descriptions[i]+': ' + report[0][key]);
          }            
        }        
        this.setState({
          katasterAssetsFromDeclaration : katasterAssetsFromDeclaration,
          hnutelnyAssetsFromDeclaration : hnutelnyAssetsFromDeclaration,
          prijmyAssetsFromDeclaration : prijmyAssetsFromDeclaration,
          report : report,
          index : 0,
        });
      });
  }

  render() {    
    return (      
      <div className="detail-page">
        <div className="detail-header">
          <div className="detail-navigation">
            <a href="./" className="brand"><b>profil</b>.verejne.digital <i className="fa fa-home"></i></a>
          </div>
        </div>
        {this.state.politician.surname &&
        <div className="detail-body">
          <DetailVizitka politician={this.state.politician} />
          <div className="data-tables">
            <div className="assets-tables">
              <DetailAssetDeclaration assets={this.state.katasterAssetsFromDeclaration}              
                year={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index].year : 0)}
                title="Majetkové priznanie: Nehnuteľnosti"
                image={`https://verejne.digital/img/majetok/${this.state.politician.surname}_${this.state.politician.firstname}.png`}
                source={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index]["source"] : "http://www.nrsr.sk")}/>
              <DetailAssetDeclaration assets={this.state.hnutelnyAssetsFromDeclaration}              
                year={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index].year : 0)}
                title="Majetkové priznanie: Hnuteľný majetok"
                source={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index]["source"] : "http://www.nrsr.sk")}/>  
              <DetailAssetDeclaration assets={this.state.prijmyAssetsFromDeclaration}              
                year={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index].year : 0)}
                title="Majetkové priznanie: ostatné"
                source={(this.state.report[this.state.index] !== undefined ? this.state.report[this.state.index]["source"] : "http://www.nrsr.sk")}/>  
            </div>
            <DetailKatasterTable kataster={this.state.kataster} />
          </div>
          <div className="mapa">
            <MapContainer assets={this.state.kataster} />
          </div>          
        </div>                
        }
      </div>
    );
  }
}

export default DetailPage;
