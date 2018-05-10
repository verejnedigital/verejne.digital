import React, {Component} from 'react'
import DetailKatasterLV from './DetailCadastralLV'
import {Table} from 'reactstrap'

class DetailKatasterTable extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.kataster !== nextProps.kataster
  }

  onParcelShow(lv, event) {
    if (
      event.target.tagName.toLowerCase() !== 'a' &&
      event.target.parentElement.tagName.toLowerCase() !== 'a'
    ) {
      this.props.onParcelShow(lv)
    }
  }

  render() {
    const self = this
    return (
      <Table>
        <thead>
          <tr>
            <th />
            <th>Údaje z Katastra ({this.props.kataster.length})</th>
          </tr>
        </thead>
        <tbody>
          {this.props.kataster.map((lv, key) => (
            <DetailKatasterLV
              key={key}
              num={key + 1}
              lv={lv}
              onParcelShow={self.onParcelShow.bind(self, lv)}
            />
          ))}
        </tbody>
      </Table>
    )
  }
}

export default DetailKatasterTable
