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

  searchOnClick(val) {    
    this.props.filterNames(val);
  }

  updateInputValue(e) {    
    this.setState({
      [e.target.id]: e.target.value,
      search : e.target.value,
    });    
    this.searchOnClick(e.target.value);    
  }

  searchOnClickOnEnter(e) {    
    if (e.key === 'Enter') {
      this.searchOnClick(e.target.value);
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
              placeholder="Meno a priezvisko alebo politická strana"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
