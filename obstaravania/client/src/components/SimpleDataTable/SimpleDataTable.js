import React, { Component } from 'react';
import './SimpleDataTable.css';

export default class SimpleDataTable extends Component {

  /*
  example:
  data = [
    {
      label: 'aaa'
      body: 'bbbb'
    },
    {
      label: 'ccc'
      body: <strong>sample text</strong>
    },
  ]
   */

  static defaultProps = {
    data: null
  };

  render() {
    if (this.props.data === null || this.props.data.length === 0) {
      return null;
    }

    const rows = this.props.data.map((item, index) => (
      <tr key={index}>
        <td>
          <div className="media">
            <div className="media-left">
              <span className="my-label">{item.label}</span>
            </div>
            <div className="media-body">
              {item.body}
            </div>
          </div>
        </td>
      </tr>
      ));

    return (
      <table className="dataTable table table-responsive">
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}
