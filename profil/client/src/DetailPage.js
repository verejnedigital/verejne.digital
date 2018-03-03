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
      years: [],
      currentYear: null,
      reportData: {},
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

  static split_assets(obj, split_str) {
    if (obj !== undefined && obj[split_str] !== undefined) {
      return obj[split_str].split('\n');
    } else {
      return [];
    }
  }

  static parseReport(reportYear) {
    // Report contains asset declarations for several years.
    // TODO: Make sure it is sorted by year from the most recent to the oldest
    const katasterAssetsFromDeclaration = DetailPage.split_assets(reportYear, "unmovable_assets");
    const hnutelnyAssetsFromDeclaration = DetailPage.split_assets(reportYear, "movable_assets");
    let prijmyAssetsFromDeclaration = [];
    if (reportYear !== undefined) {
        let keys = ["income", "compensations", "other_income", "offices_other"];
        let descriptions = ["príjmy ", "paušálne náhrady", "ostatné príjmy", "počas výkonu verejnej funkcie má tieto funkcie (čl. 7 ods. 1 písm. c) u. z. 357/2004)"];
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            prijmyAssetsFromDeclaration.push(descriptions[i]+': ' + reportYear[key]);
        }
    }

    return {
      katasterAssetsFromDeclaration: katasterAssetsFromDeclaration,
      hnutelnyAssetsFromDeclaration: hnutelnyAssetsFromDeclaration,
      prijmyAssetsFromDeclaration: prijmyAssetsFromDeclaration,
    }
  }

  loadAssetDeclaration(id) {
    serverAPI.loadAssetDeclaration(id,
      (report) => {
        let reportByYear = {};
        let latestYear = null;
        let availableYears = [];
        for (let i = 0; i < report.length; i++) {
          availableYears.push(report[i].year);
          reportByYear[report[i].year] = DetailPage.parseReport(report[i]);
        }

        availableYears.sort().reverse();
        if (availableYears.length > 0) {
            latestYear = availableYears[0];
        }

        this.setState({
          katasterAssetsFromDeclaration : reportByYear[latestYear].katasterAssetsFromDeclaration,
          hnutelnyAssetsFromDeclaration : reportByYear[latestYear].hnutelnyAssetsFromDeclaration,
          prijmyAssetsFromDeclaration : reportByYear[latestYear].prijmyAssetsFromDeclaration,
          reportData: reportByYear,
          years: availableYears,
          currentYear: latestYear,
        });
      });
  }

  selectYear(year) {
    this.setState({
        currentYear: year,
        katasterAssetsFromDeclaration : this.state.reportData[year].katasterAssetsFromDeclaration,
        hnutelnyAssetsFromDeclaration : this.state.reportData[year].hnutelnyAssetsFromDeclaration,
        prijmyAssetsFromDeclaration : this.state.reportData[year].prijmyAssetsFromDeclaration,
    });
  }

  render() {
    let yearTabs = [];
    for (let i = 0; i < this.state.years.length; i++) {
      let className = "tab";
      if (this.state.currentYear === this.state.years[i]) {
          className = "tab active";
      }
      yearTabs.push(
          <span className={className} key={this.state.years[i]} onClick={this.selectYear.bind(this, this.state.years[i])}>{this.state.years[i]}</span>
      );
    }

    return (      
      <div className="detail-page">
        <div className="detail-header">
          <div className="detail-navigation">
            <a href="./" className="brand"><b>profil</b>.verejne.digital <i className="fa fa-home"/></a>
          </div>
        </div>
        {this.state.politician.surname &&
        <div className="detail-body">
          <DetailVizitka politician={this.state.politician} />
          <div className="data-tables">
            <div className="assets-tables">
              <div className="tabs">
                  {yearTabs}
              </div>
              <DetailAssetDeclaration assets={this.state.katasterAssetsFromDeclaration}
                year={this.state.currentYear}
                title="Majetkové priznanie: Nehnuteľnosti"
                image={`https://verejne.digital/img/majetok/${this.state.politician.surname}_${this.state.politician.firstname}.png`}
                source={this.state.currentYear !== null ? this.state.reportData[this.state.currentYear]["source"] : "http://www.nrsr.sk"}/>
              <DetailAssetDeclaration assets={this.state.hnutelnyAssetsFromDeclaration}              
                year={this.state.currentYear}
                title="Majetkové priznanie: Hnuteľný majetok"
                source={this.state.currentYear !== null ? this.state.reportData[this.state.currentYear]["source"] : "http://www.nrsr.sk"}/>
              <DetailAssetDeclaration assets={this.state.prijmyAssetsFromDeclaration}              
                year={this.state.currentYear}
                title="Majetkové priznanie: ostatné"
                source={this.state.currentYear !== null ? this.state.reportData[this.state.currentYear]["source"] : "http://www.nrsr.sk"}/>
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
