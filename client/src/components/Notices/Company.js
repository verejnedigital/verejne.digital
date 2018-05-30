import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import './LegendSymbols.css'
import {addCommas} from './utilities'
import {formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from './CompanyDetails'
import './NoticeItem.css'

class Company extends Component {
  componentWillMount() {
    const state = {
      showRelated: false,
    }
    this.setState(state)
  }

  toggleCompanyDetails = () => {
    const stateChange = {showCompanyDetails: !this.state.showCompanyDetails}
    this.setState(stateChange)
  }

  render() {
    const item = this.props.item
    return (
      <tr>
        <td>
          {this.state.showCompanyDetails && item.eid ? ([
            <a key="close" className="company-link" onClick={() => this.toggleCompanyDetails()}>[-]</a>,
            <CompanyDetails key="company" eid={item.eid} />,
          ]
          ) : (
            <a className="company-link" onClick={() => this.toggleCompanyDetails()}>{item.name}</a>
          )
          }
        </td>
        <td><Link to={`/obstaravania/${item.id}`}>{item.title}</Link></td>
        <td>{item.customer}</td>
        <td className="text-nowrap text-right"><strong>{addCommas(item.price)}</strong></td>
        <td className="text-center"><span className="similarity">{formatSimilarPercent(Math.round(item.score * 100))}</span></td>
      </tr>
    )
  }
}

export default Company
