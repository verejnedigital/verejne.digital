// @flow
import React, {PureComponent} from 'react'
import EntityWrapper from '../../dataWrappers/EntityWrapper'
import ConnectionWrapper from '../../dataWrappers/ConnectionWrapper'
import Alternative from './Alternative'

class Statuses extends PureComponent {
  state = {
    showAlternatives1: false,
    showAlternatives2: false,
  }

  translateZaznam(count, onClickMethod) {
    const button = <strong onClick={onClickMethod}>{count}</strong>
    if (count === 1) {
      return <span>Nájdený {button} záznam</span>
    } else if (count > 1 && count < 5) {
      return <span>Nájdené {button} záznamy</span>
    }
    return <span>Nájdených {button} záznamov</span>
  }

  render() {
    const {entity1, entity2, connections} = this.props
    const {showAlternatives1, showAlternatives2} = this.state
    return (
      <div className="statuses">
        {connections &&
          (connections.length > 0 ? (
            <span id="search-status" className="searchStatus">
              Dĺžka prepojenia: <strong>{connections.length - 1}</strong>.&nbsp;
            </span>
          ) : (
            <span id="search-status" className="searchStatus">
              Prepojenie neexistuje.&nbsp;
            </span>
          ))}
        {entity1 && (
          <span id="search-status1" className="searchStatus">
            {this.translateZaznam(entity1.eids.length, () =>
              this.setState({showAlternatives1: true})
            )}{' '}
            pre &quot;{entity1.id}&quot;.&nbsp;
          </span>
        )}
        {entity2 && (
          <span id="search-status2" className="searchStatus">
            {this.translateZaznam(entity2.eids.length, () =>
              this.setState({showAlternatives2: true})
            )}{' '}
            pre &quot;{entity2.id}&quot;.&nbsp;
          </span>
        )}
        {showAlternatives1 &&
          entity1 &&
          entity1.eids &&
          entity1.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
        {showAlternatives2 &&
          entity2 &&
          entity2.eids &&
          entity2.eids.map((eid) => <Alternative key={eid} eid={eid} />)}
      </div>
    )
  }
}

export default EntityWrapper(ConnectionWrapper(Statuses))
