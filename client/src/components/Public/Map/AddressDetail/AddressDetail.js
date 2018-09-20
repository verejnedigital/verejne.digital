// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../../dataProviders/sharedDataProviders'
import {addressEntitiesSelector, addressEntitiesIdsSelector} from '../../../../selectors'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../../constants'
import {closeAddressDetail, toggleEntityInfo} from '../../../../actions/publicActions'
import {ListGroup} from 'reactstrap'
import {map, chunk, flatten} from 'lodash'
import ListRow from './ListRow'
import type {State} from '../../../../state'
import './AddressDetail.css'

type Entity = {
  addressId: number,
  id: number,
  name: string,
}

type OwnProps = {
  addressIds: Array<number>,
}
type StateProps = {
  entities: Array<Entity>,
  addressId: number,
  hasStateTraders: boolean,
  closeAddressDetail: () => void,
  toggleEntityInfo: (id: number) => void,
}

type AddressDetailProps = OwnProps & StateProps

const DETAILS_HEADER_HEIGHT = 37

class AddressDetail extends React.Component<AddressDetailProps> {
  constructor(props: AddressDetailProps) {
    super(props)
    if (props.entities.length === 1) {
      props.toggleEntityInfo(props.entities[0].id)
    }
  }
  render = () => (
    <div className="address-detail">
      <div className="address-detail-header" style={{height: DETAILS_HEADER_HEIGHT}}>
        <button type="button" className="close" onClick={this.props.closeAddressDetail}>
          <span>&times;</span>
        </button>
      </div>
      <ListGroup className="address-detail-list">
        {map(this.props.entities, (e) => <ListRow entity={e} key={e.id} />)}
      </ListGroup>
    </div>
  )
}
export default compose(
  connect(
    (state: State) => ({
      entities: addressEntitiesSelector(state),
      entitiesIds: addressEntitiesIdsSelector(state),
    }),
    {
      closeAddressDetail,
      toggleEntityInfo,
    }
  ),
  withDataProviders(({addressIds}: OwnProps) =>
    flatten(addressIds.map((singleId: number) => [addressEntitiesProvider(singleId)]))
  ),
  withDataProviders(
    ({entitiesIds}) =>
      entitiesIds.length
        ? chunk(entitiesIds, MAX_ENTITY_REQUEST_COUNT).map((ids) => entityDetailProvider(ids))
        : []
  ),
)(AddressDetail)
