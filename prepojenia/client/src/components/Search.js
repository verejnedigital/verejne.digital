import React, { Component } from 'react';

import './Search.css';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entitysearch1: props.entitysearch1,
      entitysearch2: props.entitysearch2,
    };
    this.updateInputValue = this.updateInputValue.bind(this);
    this.searchOnClickOnEnter = this.searchOnClickOnEnter.bind(this);
    this.searchOnClick = this.searchOnClick.bind(this);
  }

  updateInputValue(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  searchOnClick() {
    this.props.searchConnection(this.state.entitysearch1, this.state.entitysearch2);
  }

  searchOnClickOnEnter(e) {
    if (e.key === 'Enter') {
      this.searchOnClick();
    }
  }

  render() {
    return (
      <div className="searchForm">
        <div className="searchLabel row">
          <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
            <h2 className="searchTitle">Vyhľadaj</h2>
            najkratšie spojenie medzi dvojicou:
          </div>
        </div>
        <div className="form-horizontal">
          <div className="entitysearch form-group">
            <label htmlFor="entitysearch1" className="col-sm-2 control-label col-xs-2">01</label>
            <div className="col-sm-10  col-xs-10">
              <input
                id="entitysearch1" className="form-control" type="text"
                value={this.state.entitysearch1} onChange={this.updateInputValue}
                onKeyPress={this.searchOnClickOnEnter}
                placeholder="Zadaj prvú firmu / človeka"
              />
            </div>
          </div>
          <div className="entitysearch form-group">
            <label htmlFor="entitysearch2" className="col-sm-2 control-label col-xs-2">02</label>
            <div className="col-sm-10 col-xs-10">
              <input
                id="entitysearch2" className="form-control" type="text"
                value={this.state.entitysearch2} onChange={this.updateInputValue}
                onKeyPress={this.searchOnClickOnEnter}
                placeholder="Zadaj druhú firmu / človeka"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
              <button
                className="searchButton btn btn-primary"
                onClick={this.searchOnClick}
              >Vyhľadať</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
