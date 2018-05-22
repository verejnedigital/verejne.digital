import React, {PureComponent} from 'react'

import './Search.css'

class Search extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      entitySearch1: props.entitySearch1 || '',
      entitySearch2: props.entitySearch2 || '',
    }
  }

  updateInputValue = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    })
  }

  searchOnClick = () => {
    this.props.searchConnection(this.state.entitySearch1, this.state.entitySearch2)
  }

  checkEnter = (e) => {
    if (e.key === 'Enter') {
      this.searchOnClick()
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
            <label htmlFor="entitySearch1" className="col-sm-2 control-label col-xs-2">
              01
            </label>
            <div className="col-sm-10  col-xs-10">
              <input
                id="entitySearch1"
                className="form-control"
                type="text"
                value={this.state.entitySearch1}
                onChange={this.updateInputValue}
                onKeyPress={this.searchOnClickOnEnter}
                placeholder="Zadaj prvú firmu / človeka"
              />
            </div>
          </div>
          <div className="entitysearch form-group">
            <label htmlFor="entitySearch2" className="col-sm-2 control-label col-xs-2">
              02
            </label>
            <div className="col-sm-10 col-xs-10">
              <input
                id="entitySearch2"
                className="form-control"
                type="text"
                value={this.state.entitySearch2}
                onChange={this.updateInputValue}
                onKeyPress={this.checkEnter}
                placeholder="Zadaj druhú firmu / človeka"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
              <button className="searchButton btn btn-primary" onClick={this.searchOnClick}>
                Vyhľadať
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Search
