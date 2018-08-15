import React, {Component, Fragment} from 'react'
import DetailCadastralLV from './DetailCadastralLV'
import {CADASTRAL_PAGINATION_SIZE, CADASTRAL_PAGINATION_CHUNK_SIZE} from '../../../constants'
import {modifyQuery} from '../../../utils'
import Pagination from 'react-js-pagination'
import {Table} from 'reactstrap'

class DetailCadastralTable extends Component {
  onParcelShow = (lv) => {
    this.props.onParcelShow(lv)
  }

  render() {
    const {cadastral, cadastralLength, currentPage, search, query, history} = this.props

    const pagination = (
      <div>
        <Pagination
          itemClass="page-item"
          linkClass="page-link"
          hideNavigation
          pageRangeDisplayed={CADASTRAL_PAGINATION_SIZE}
          activePage={currentPage}
          itemsCountPerPage={CADASTRAL_PAGINATION_CHUNK_SIZE}
          totalItemsCount={cadastralLength}
          onChange={(page) => history.push({search: modifyQuery(query, {cadastralPage: page})})}
        />
      </div>
    )

    return (
      <Fragment>
        {pagination}
        <input
          id="search"
          className="form-control search-input"
          type="text"
          value={search}
          onChange={(e) =>
            history.push({
              search: modifyQuery(query, {
                cadastralSearch: e.target.value,
                cadastralPage: 1,
              }),
            })
          }
          placeholder="Obec"
        />
        <Table>
          <thead>
            <tr>
              <th />
              <th>Údaje z Katastra ({cadastralLength})</th>
            </tr>
          </thead>
          <tbody>
            {cadastral.map((lv, key) => (
              <DetailCadastralLV
                key={key}
                num={key + 1+(currentPage-1)*CADASTRAL_PAGINATION_CHUNK_SIZE}
                lv={lv}
                onParcelShow={() => this.onParcelShow(lv)}
              />
            ))}
          </tbody>
        </Table>
        {pagination}
      </Fragment>
    )
  }
}

export default DetailCadastralTable
