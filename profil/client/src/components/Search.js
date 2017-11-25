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

  searchOnClick() {
    this.props.filterNames(this.state.search);
  }

  updateInputValue(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });    
  }

  searchOnClickOnEnter(e) {
    console.log(this.props.names);  // Rasto: Tu mas mena
    if (e.key === 'Enter') {
      this.searchOnClick();
    }
  }

  render() {
    return (
      <div className="searchForm">
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
