// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {addressEntitiesSelector} from '../../../../selectors'
import {ListGroup} from 'reactstrap'
import {map} from 'lodash'
import ListRow from './ListRow'

const AddressDetail = ({entities}) => (
  <ListGroup>
    {map(entities, (e) => (
      <ListRow entity={e} key={e.id} />
    ))}
  </ListGroup>
)

export default compose(
  connect(
    (state, {addressId}) => ({
      entities: addressEntitiesSelector(state),
    })
  ),
  withDataProviders(({addressId}) => [addressEntitiesProvider(addressId)])
)(AddressDetail)
