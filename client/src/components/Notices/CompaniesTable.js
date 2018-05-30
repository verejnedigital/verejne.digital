import React from 'react'
import Company from './Company'

export default ({item}) => {
  if (item === null) {
    return null
  }
  let items = <tr><td colSpan={6} className="text-center">Žiadni kandidáti</td></tr>

  if (item.kandidati.length > 0) {
    items = item.kandidati.map(
      (item) => <Company key={item.id} item={item} />,
    )
  }

  return [
    <header key="header">
      <h3>Kto by sa mal prihlásiť</h3>
    </header>,
    <table key="companies" className="dataTable table table-responsive table-condensed">
      <thead>
        <tr>
          <td>Firma</td>
          <td>Čo podobné vyhral</td>
          <td>Objednávateľ</td>
          <td>Cena €</td>
          <td>Pod.</td>
        </tr>
      </thead>
      <tbody>
        {items}
      </tbody>
    </table>,
  ]
}
