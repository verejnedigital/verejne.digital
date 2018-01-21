import React, { Component } from 'react';
import TableLine from './TableLine';
import './Table.css';

class Table extends Component {
  
  render() {
    return (
      <table className="table">
        <thead>
          <tr>            
            <th></th>
            <th></th>
            <th>Meno a priezvisko</th>
            <th>Obdobie</th>
            <th className="party-column">Strana</th>
            <th className="number-column" title="Domy, byty a iné stavby">Stavby</th>
            <th className="number-column">Orná pôda &amp; záhrady</th>
            <th className="number-column">Ostatné</th>
          </tr>
        </thead>
        <tbody>
          {this.props.politicians.map(politician =>
            <TableLine key={politician.id}  politician={politician}/>,
          )}
          
        </tbody>
      </table>
    )
  }
}

export default Table;
