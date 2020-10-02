// @flow
import React, {Component} from 'react'
import ExternalLink from '../../shared/ExternalLink'

import './DetailCadastralLV.css'

import type {CadastralData} from '../../../state'

type DetailCadastralLVProps = {
  lv: CadastralData,
  num: number,
  onParcelShow: () => void,
}

class DetailCadastralLV extends Component<DetailCadastralLVProps> {
  disablePropagation = (event: Event) => {
    event.stopPropagation()
  }

  render() {
    return (
      <tr
        onClick={this.props.lv.lon && this.props.lv.lat ? this.props.onParcelShow : null}
        className="parcel"
      >
        <td className="key">{this.props.num < 10 ? `0${this.props.num}` : this.props.num}</td>
        <td>
          <ExternalLink
            url={`https://kataster.skgeodesy.sk/Portal/api/Bo/GeneratePrfPublic?prfNumber=${
              this.props.lv.foliono
            }&cadastralUnitCode=${this.props.lv.cadastralunitcode}&outputType=html`}
            onClick={this.disablePropagation}
          >
            {this.props.lv.landusename || 'List Vlastníctva'}
          </ExternalLink>
          <br />
          {`${this.props.lv.cadastralunitname}, LV č. ${this.props.lv.foliono}${
            this.props.lv.parcelno ? `; parcely: ${this.props.lv.parcelno}` : ''
          }`}
        </td>
      </tr>
    )
  }
}

export default DetailCadastralLV
