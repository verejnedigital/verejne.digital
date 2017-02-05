import React from 'react';

const SearchResult = ({ data }) => {
  const entity = data.entities[0];
  return (
    <a className="list-group-item list-group-item-info" style={{ borderColor: 'black' }}>
      <table>
        <tbody>
          <tr>
            <td>
              <b>{entity.entity_name}&nbsp;&nbsp;</b>
              <a title="Zobraz na mape" target="_blank" rel="noopener noreferrer" href={`?zobraz& ${entity.lat}&${entity.lng}&${entity.eid}&`}>⎈</a>
            </td>
          </tr>
          <tr>
            <td>
              {entity.address}
            </td>
          </tr>
        </tbody>
      </table>
    </a>
  );
};

export default SearchResult;
