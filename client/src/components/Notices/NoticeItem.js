import React, {Component} from 'react'
import './LegendSymbols.css'
import {getWarning, getTitle} from './utilities'
import {formatSimilarCount, formatSimilarPercent} from './LegendSymbols'
import CompanyDetails from '../shared/CompanyDetails'
import {Link} from 'react-router-dom'
import './NoticeItem.css'

class NoticeItem extends Component {
  componentWillMount() {
    const state = {
      companyDetails: false,
    }
    this.setState(state)
  }

  toggleCompanyDetails = () => {
    const stateChange = {companyDetails: !this.state.companyDetails}
    this.setState(stateChange)
  }

  render() {
    const item = this.props.item
    const similarity = item.kandidati.length > 0 ? Math.round(item.kandidati[0].score * 100) : '?'
    const similarCount = item.kandidati.length > 20 ? '20+' : item.kandidati.length
    return (
      <tr title={getTitle(item)}>
        <td className="text-right">
          <span className="similar-count">{formatSimilarCount(similarCount)}</span>
        </td>
        <td>
          <Link to={`/obstaravania/${item.id}`}>{item.title}</Link> {getWarning(item)}
        </td>
        <td>{item.customer}</td>
        <td>
          {this.state.companyDetails && item.kandidati[0].eid ? (
            [
              <a key="close" className="company-link" onClick={() => this.toggleCompanyDetails()}>
                [-]
              </a>,
              <CompanyDetails key="company" eid={item.kandidati[0].eid} />,
            ]
          ) : (
            <a className="company-link" onClick={() => this.toggleCompanyDetails()}>
              {item.kandidati[0].name ? item.kandidati[0].name : '?'}
            </a>
          )}
        </td>
        <td className="text-center">
          <span className="similarity">{formatSimilarPercent(similarity)}</span>
        </td>
      </tr>
    )
  }
}

export default NoticeItem
