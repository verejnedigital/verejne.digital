import React, {Component} from 'react';
import DetailKatasterLV from './DetailKatasterLV';
import './DetailKatasterTable.css';

class DetailKatasterTable extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.kataster !== nextProps.kataster;
  }

  onParcelShow(lv, event) {
      if (event.target.tagName.toLowerCase() !== 'a' &&
          event.target.parentElement.tagName.toLowerCase() !== 'a') {
        this.props.onParcelShow(lv);
      }
  }

  render() {
      let that = this;
      return (
        <table className="kataster table">
          <thead>
          <tr>
              <th/>
              <th>Údaje z Katastra ({this.props.kataster.length})</th>
          </tr>
          </thead>
          <tbody>
          {this.props.kataster.map((lv, key) =>
              <DetailKatasterLV key={key} num={key+1} lv={lv} onParcelShow={that.onParcelShow.bind(that, lv)}/>,
          )}
          </tbody>
        </table>
      );
  }
}

export default DetailKatasterTable;