import React, { Component } from 'react';
import TableLine from './TableLine';
import './Table.css';

class Table extends Component {
  
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Meno a priezvisko</th>
            <th>Strana</th>
            <th className="numbercolumn">Domy &amp; Byty</th>
            <th className="numbercolumn">Orna poda &amp; zahrady</th>
            <th className="numbercolumn">Ostatne</th>
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