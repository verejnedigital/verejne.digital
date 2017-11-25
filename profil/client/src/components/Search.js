import React, { Component } from 'react';

import './Search.css';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
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
    alert(this.state.search);
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
          <div className="entitysearch">
            <input
              id="search" className="form-control" type="text"
              value={this.state.search} onChange={this.updateInputValue}
              onKeyPress={this.searchOnClickOnEnter}
              placeholder="Meno a priezvisko"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
