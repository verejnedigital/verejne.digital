import React from 'react'
import Company from './Company'
import {compose, branch, renderNothing} from 'recompose'

const _CompaniesTable = ({item}) => {
  if (item === null) {
    return null
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
        {(item.kandidati.length > 0)
          ? item.kandidati.map((item) => <Company key={item.id} item={item} />)
          : (
            <tr>
              <td colSpan={6} className="text-center">
                Žiadni kandidáti
              </td>
            </tr>
          )}
      </tbody>
    </table>,
  ]
}

export default compose(
  branch((props) => props.item === null, renderNothing)
)(_CompaniesTable)
