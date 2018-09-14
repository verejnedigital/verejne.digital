// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../../dataProviders/sharedDataProviders'
import {sortedAddressEntityDetailsSelector, addressEntitiesIdsSelector} from '../../../../selectors'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../../constants'
import {closeAddressDetail, toggleEntityInfo} from '../../../../actions/publicActions'
import {ListGroup, Button} from 'reactstrap'
import {map, chunk, flatten} from 'lodash'
import ListRow from './ListRow'
import type {State, NewEntityDetail} from '../../../../state'
import './AddressDetail.css'

type OwnProps = {
  addressIds: Array<number>,
}
type StateProps = {
  entityDetails: Array<NewEntityDetail>,
  addressId: number,
  onClick: (e: Event) => void,
  hasStateTraders: boolean,
  closeAddressDetail: () => void,
  toggleEntityInfo: (id: number) => void,
}

type AddressDetailProps = OwnProps &
  StateProps & {
    onClick: (e: Event) => void,
  }

const DETAILS_HEADER_HEIGHT = 37

class AddressDetail extends React.Component<AddressDetailProps> {
  constructor(props: AddressDetailProps) {
    super(props)
    if (props.entityDetails.length === 1) {
      props.toggleEntityInfo(props.entityDetails[0].eid)
    }
  }
  render = () => (
    <div className="address-detail">
      <div className="address-detail-header" style={{height: DETAILS_HEADER_HEIGHT}}>
        <Button color="link" onClick={this.props.onClick}>
          Close detail
        </Button>
      </div>
      <ListGroup className="address-detail-list">
        {map(this.props.entityDetails, (e) => <ListRow entityDetail={e} key={e.eid} />)}
      </ListGroup>
    </div>
  )
}
export default compose(
  connect(
    (state: State) => ({
      entitiesIds: addressEntitiesIdsSelector(state),
      entityDetails: sortedAddressEntityDetailsSelector(state),
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
  withHandlers({
    onClick: ({closeAddressDetail}: StateProps) => closeAddressDetail,
  })
)(AddressDetail)
