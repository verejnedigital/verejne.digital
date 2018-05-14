import React, {Component} from 'react'

import './DetailCadastralLV.css'

class DetailCadastralLV extends Component {

  disablePropagation = (event) => {
    event.stopPropagation()
  }

  render() {
    return (
      <tr onClick={this.props.onParcelShow} className="parcel">
        <td className="key">{this.props.num < 10 ? `0${this.props.num}` : this.props.num}</td>
        <td>
          <a
            target="_BLANK"
            href={`https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?prfNumber=${
              this.props.lv.foliono
            }&cadastralUnitCode=${this.props.lv.cadastralunitcode}&outputType=html`}
            onClick={this.disablePropagation}
          >
            {this.props.lv.landusename}&nbsp;<i className="fa fa-external-link" aria-hidden="true" />
          </a>
          <br />
          {`${this.props.lv.cadastralunitname}, LV č. ${this.props.lv.foliono}; parcely: ${this.props.lv.parcelno}`}
        </td>
      </tr>
    )
  }
}

export default DetailCadastralLV
