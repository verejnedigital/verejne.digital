import React, { Component } from 'react';

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
          <tr>
              <td>Mikulas Basternak</td>
              <td>KDH</td>
              <td className="numbercolumn">8</td>
              <td className="numbercolumn">24</td>
              <td className="numbercolumn">3</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export default Table;