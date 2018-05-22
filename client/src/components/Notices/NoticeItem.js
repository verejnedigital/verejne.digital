import React, {Component} from 'react'
import './LegendSymbols.css'
import {getWarning, getTitle} from './utilities'
import {formatSimilarCount, formatSimilarPercent} from './LegendSymbols'
import NoticeRelated from './NoticeRelated'
import {Link} from 'react-router-dom'

class NoticeItem extends Component {
  componentWillMount() {
    const state = {
      showRelated: false,
    }
    this.setState(state)
  }

  toggleRelated = () => {
    const stateChange = {showRelated: !this.state.showRelated}
    this.setState(stateChange)
  }

  render() {
    const item = this.props.item
    let candidate = '?'
    if (item.kandidati.length > 0) {
      candidate = (
        <a className="cursor-pointer" onClick={() => this.toggleRelated()}>{item.kandidati[0].name}</a>
      )
    }

    const similarity = item.kandidati.length > 0 ? Math.round(item.kandidati[0].score * 100) : '?'

    const similarCount = item.kandidati.length > 20 ? '20+' : item.kandidati.length

    return (
      <tr title={getTitle(item)}>
        <td className="text-right"><span className="similar-count">{formatSimilarCount(similarCount)}</span></td>
        <td><Link to={`/obstaravania/${item.id}`}>{item.title}</Link> {getWarning(item)}</td>
        <td>{item.customer}</td>
        <td>
          {candidate}
          {this.state.showRelated && item.kandidati[0].eid &&
            <NoticeRelated eid={item.kandidati[0].eid} />
          }
        </td>
        <td className="text-center"><span className="similarity">{formatSimilarPercent(similarity)}</span></td>
      </tr>
    )
  }
}

export default NoticeItem
