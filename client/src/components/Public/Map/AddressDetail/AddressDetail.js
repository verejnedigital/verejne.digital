// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {addressEntitiesSelector} from '../../../../selectors'
import {closeAddressDetail} from '../../../../actions/publicActions'
import {ListGroup, Button} from 'reactstrap'
import {map} from 'lodash'
import ListRow from './ListRow'
import './AddressDetail.css'

const AddressDetail = ({entities, addressId, onClick}) => (
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
    (state) => ({
      entities: addressEntitiesSelector(state),
    }),
    {
      closeAddressDetail,
    }
  ),
  withDataProviders(({addressId}) => [addressEntitiesProvider(addressId)]),
  withHandlers({
    onClick: ({closeAddressDetail}) => (event) => {
      closeAddressDetail()
    },
  })
)(AddressDetail)
