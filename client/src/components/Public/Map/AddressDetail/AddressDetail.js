// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../../dataProviders/sharedDataProviders'
import {addressEntitiesSelector, addressEntitiesIdsSelector} from '../../../../selectors'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../../constants'
import {closeAddressDetail} from '../../../../actions/publicActions'
import {ListGroup, Button} from 'reactstrap'
import {map, chunk} from 'lodash'
import ListRow from './ListRow'
import './AddressDetail.css'

type Entity = {
  addressId: number,
  id: number,
  name: string,
}

type AddressDetailProps = {|
  entities: Array<Entity>,
  addressId: number,
  onClick: (e: Event) => void,
  hasStateTraders: boolean,
|}

const AddressDetail = ({entities, addressId, onClick, hasStateTraders}: AddressDetailProps) => (
  <div className="address-detail">
    <div className="address-detail-header">
      <Button color="link" onClick={onClick}>
        Close detail
      </Button>
    </div>
    <ListGroup className="address-detail-list">
      {map(entities, (e) => <ListRow entity={e} key={e.id} />)}
    </ListGroup>
  </div>
)

export default compose(
  connect(
    (state, {addressId}) => ({
      entities: addressEntitiesSelector(state),
      entitiesIds: addressEntitiesIdsSelector(state),
    }),
    {
      closeAddressDetail,
    }
  ),
  withDataProviders(({addressId}) => [addressEntitiesProvider(addressId)]),
  withDataProviders(({entitiesIds}) => entitiesIds.length ?
    chunk(entitiesIds, MAX_ENTITY_REQUEST_COUNT).map((ids) => entityDetailProvider(ids)) : []
  ),
  withHandlers({
    onClick: ({closeAddressDetail}) => (event) => {
      closeAddressDetail()
    },
  })
)(AddressDetail)
