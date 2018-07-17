// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {addressEntitiesSelector} from '../../../../selectors'
import {ListGroup, Button} from 'reactstrap'
import {map} from 'lodash'
import ListRow from './ListRow'
import './AddressDetail.css'

const AddressDetail = ({entities, addressId}) => (
  <div className="address-detail">
    <div className="address-detail-header">
      {/* TODO: Fix missing action so it's possible to close this modal */}
      <Button color="link">Close detail</Button>
    </div>
    <ListGroup className="address-detail-list">
      {map(entities, (e) => <ListRow entity={e} key={e.id} />)}
    </ListGroup>
  </div>
)

export default compose(
  connect((state, {addressId}) => ({
    entities: addressEntitiesSelector(state),
  })),
  withDataProviders(({addressId}) => [addressEntitiesProvider(addressId)])
)(AddressDetail)
