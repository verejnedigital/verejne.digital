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
            <th>Domy &amp; Byty</th>
            <th>Orna poda &amp; zahrady</th>
            <th>Ostatne</th>
          </tr>
        </thead>
        <tbody>
          <tr>
              <td>Mikulas Basternak</td>
              <td>KDH</td>
              <td>8</td>
              <td>24</td>
              <td>3</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export default Table;