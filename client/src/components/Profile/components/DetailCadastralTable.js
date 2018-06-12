import React, {Component} from 'react'
import DetailCadastralLV from './DetailCadastralLV'
import {Table} from 'reactstrap'

class DetailCadastralTable extends Component {
  onParcelShow = (lv) => {
    this.props.onParcelShow(lv)
  }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th />
            <th>Údaje z Katastra ({this.props.cadastral.length})</th>
          </tr>
        </thead>
        <tbody>
          {this.props.cadastral.map((lv, key) => (
            <DetailCadastralLV
              key={key}
              num={key + 1}
              lv={lv}
              onParcelShow={() => this.onParcelShow(lv)}
            />
          ))}
        </tbody>
      </Table>
    )
  }
}

export default DetailCadastralTable
