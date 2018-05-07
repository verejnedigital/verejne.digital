import React, {Component} from 'react'
import TableLine from './TableLine'
import './Table.css'

class Table extends Component {
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th />
            <th />
            <th className="text-left column-title">Meno a priezvisko</th>
            <th className="text-left column-title">Obdobie</th>
            <th className="party-column column-title">Strana</th>
            <th className="number-column column-title" title="Domy, byty a iné stavby">Stavby</th>
            <th className="number-column column-title">Orná pôda &amp; záhrady</th>
            <th className="number-column column-title">Ostatné</th>
          </tr>
        </thead>
        <tbody>
          {this.props.politicians.map((politician) =>
            <TableLine key={politician.id} politician={politician} />,
          )}
        </tbody>
      </table>
    )
  }
}

export default Table
