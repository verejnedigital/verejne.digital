import React, { Component } from 'react';
import '../../styles/prepojenia.css';
import Info from '../info/Info';
import { searchEntity, connection, getInfo } from '../../actions/serverAPI';

class PrepojeniaPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entitysearch1: 'Kalinak',
      entitysearch2: 'Basternak',
    };
    this.searchOnClick = this.searchOnClick.bind(this);
    this.updateInputValue = this.updateInputValue.bind(this);
  }

  updateInputValue(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  searchOnClick() {
    if (this.state.entitysearch1.trim() === '' || this.state.entitysearch2.trim() === '') {
      return;
    }
    this.setState({
      searching: true,
    });

    searchEntity(this.state.entitysearch1, (eids1) => {
      this.setState({
        entity1: {
          name: this.state.entitysearch1,
          eids: eids1,
        },
      }, () => {
        searchEntity(this.state.entitysearch2, (eids2) => {
          this.setState({
            entity2: {
              name: this.state.entitysearch2,
              eids: eids2,
            },
          }, () => {
            connection(this.state.entity1.eids.map(eid => eid.eid).join(),
              this.state.entity2.eids.map(eid => eid.eid).join(),
              (conns) => {
                this.setState({
                  connections: conns,
                  searching: false,
                }, () => {
                  this.state.connections.forEach((conEid) => {
                    getInfo(conEid, (conn) => {
                      this.setState({
                        [conEid]: conn,
                      });
                    });
                  });
                });
              });
          });
        });
      });
    });
  }


  render() {
    return (
      <div className="row">
        <div className="col-md-4" style={{ padding: '10px', margin: '10px' }}>
          <div style={{ marginLeft: '0px' }}>
            <label htmlFor="entitysearch1" className="toRight">
              Nájdi najkratšie spojenie medzi dvojicou:
            </label>
          </div>
          <table>
            <tbody><tr><td style={{ verticalAlign: 'middle' }}><span style={{ fontSize: '28px' }}>&#8597;</span></td><td>
              <input
                id="entitysearch1" className="form-control entitysearch" type="text"
                value={this.state.entitysearch1} onChange={this.updateInputValue}
                placeholder="Zadaj prvú firmu / človeka"
              />
              <input
                id="entitysearch2" className="form-control entitysearch" type="text"
                value={this.state.entitysearch2} onChange={this.updateInputValue}
                placeholder="Zadaj druhú firmu / človeka"
              />
            </td></tr>
            </tbody>
          </table>

          <div className="toRight">
            <div>
              <button
                className="list-group-item list-group-item-danger searchButton"
                onClick={this.searchOnClick}
              >Hľadaj</button>
            </div><br />

            <span id="search-status1">
              {this.state.entity1 &&
                `Nájdených ${this.state.entity1.eids.length} záznamov pre "${this.state.entity1.name}"`}
              &nbsp;
            </span><br />
            <span id="search-status2">
              {this.state.entity2 &&
                `Nájdených ${this.state.entity2.eids.length} záznamov pre "${this.state.entity2.name}"`}
              &nbsp;
            </span><br />
            <span id="search-status">
              {this.state.searching ? (
                'Prebieha hľadanie prepojenia ...'
              ) : (
                this.state.connections && (
                  this.state.connections.length > 0 ? (
                    `Dĺžka prepojenia: ${this.state.connections.length - 1}.`
                  ) : (
                    'Prepojenie neexistuje.'
                  )
                )
              )}
              &nbsp;
            </span><br /><br />

            <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="151" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
          </div>
        </div>
        <div className="col-md-6">
          <div id="search-results-link" className="toRight"></div>
          <div id="search-results1"> </div>
          <div id="search-results2"> </div>
          <div id="search-results" style={{ margin: '10px' }}>
            {this.state.connections &&
               this.state.connections.reduce((res, connEid) => res &&
                (connEid in this.state), true) &&
                this.state.connections.map((connEid) => {
                  if (connEid in this.state) {
                    return (
                      <Info key={connEid} data={this.state[connEid]} />
                    );
                  }
                  return (
                    <div key={connEid}>Prebieha hľadanie</div>
                  );
                })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default PrepojeniaPage;
