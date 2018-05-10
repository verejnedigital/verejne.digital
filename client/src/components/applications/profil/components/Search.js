import React, {Component} from 'react'

import './Search.css'

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
    }
  }

  updateInputValue = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
      search: e.target.value,
    })
    this.props.filterNames(e.target.value)
  }

  searchOnClickOnEnter = (e) => {
    if (e.key === 'Enter') {
      this.props.filterNames(e.target.value)
    }
  }

  render() {
    return (
      <input
        id="search"
        className="form-control search-input"
        type="text"
        value={this.state.search}
        onChange={this.updateInputValue}
        onKeyPress={this.searchOnClickOnEnter}
        placeholder="Meno a priezvisko alebo politická strana"
      />
    )
  }
}

export default Search
