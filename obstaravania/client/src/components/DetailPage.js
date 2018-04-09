import React, { Component } from 'react';
import * as serverAPI from '../actions/serverAPI';
import InfoLoader from './info/LoadingBanner';
import { getSuspectLevelLimit, showNumberCurrency } from '../utility/utilities';
import DetailList from './DetailList';
import './DetailPage.css';
import TabLink from './info/ExternalLink';
import SimpleDataTable from './SimpleDataTable/SimpleDataTable';

export default class DetailPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentId: null,
      item: null,
    };
    this.loadData = this.loadData.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.currentId !== nextProps.params.id) {
      return { item: null, currentId: nextProps.params.id };
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.item === null) {
      this.loadData();
    }
  }

  loadData() {
    serverAPI.getObstaravanieInfo(this.state.currentId, (result) => {
      this.setState({
        item: result,
      });
    });
  }

  render() {
    if (this.state.item === null) {
      return <InfoLoader />;
    }

      const headerData = [
          {
              label: <span className="my-label">Popis:</span>,
              body: this.state.item.text,
          },
          {
              label: <span className="my-label">Objednávateľ:</span>,
              body: this.state.item.customer,
          },
      ];

    if (this.state.item.bulletin_date) {
        const vestnik = (<span>
              <TabLink
                  url={`https://www.uvo.gov.sk/evestnik?poradie=${this.state.item.bulletin_number}&year=${this.state.item.bulletin_year}`}
                  text={`${this.state.item.bulletin_number}/${this.state.item.bulletin_year}`}
              /> <span className="note">({this.state.item.bulletin_date})</span>
            </span>
        );

        headerData.push(
            {
                label: <span className="my-label">Vestník:</span>,
                body: vestnik,
            },
        );
    }

    headerData.push(
        {
            label: <span className="my-label">Vyhlásená cena:</span>,
            body: showNumberCurrency(this.state.item.price),
        },
    );

    if (this.state.item.price_num >= 5) {
      const upper = showNumberCurrency(getSuspectLevelLimit(this.state.item, 1));
      const lower = showNumberCurrency(getSuspectLevelLimit(this.state.item, -1));
      headerData.push(
        {
          label: <span className="my-label">Náš odhad:</span>,
          body: [lower, ' - ', upper],
        },
      );
    }

    return (
      <div>
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <h3 className="title">{this.state.item.title}</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="section">
              <SimpleDataTable data={headerData} />
            </div>
            <div className="connectLine" />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <DetailList item={this.state.item} />
          </div>
        </div>
      </div>
    );
  }
}
