// @flow
import React from 'react'
import {connect} from 'react-redux'
import {withHandlers, compose} from 'recompose'
import {withDataProviders} from 'data-provider'
import {addressEntitiesProvider} from '../../../../dataProviders/publiclyDataProviders'
import {entityDetailProvider} from '../../../../dataProviders/sharedDataProviders'
import {addressEntitiesSelector, addressEntitiesIdsSelector} from '../../../../selectors'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../../constants'
import {closeAddressDetail, toggleEntityInfo} from '../../../../actions/publicActions'
import {withAutosize} from '../../../../utils'
import {ListGroup, Button} from 'reactstrap'
import {map, chunk, flatten} from 'lodash'
import ListRow from './ListRow'
import type {State} from '../../../../state'
import type {AutoSizeProps} from '../../../../utils'
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
  onClick: (e: Event) => void,
  hasStateTraders: boolean,
  width: number,
  height: number,
  closeAddressDetail: () => void,
  toggleEntityInfo: (id: number) => void,
}

type AddressDetailProps = OwnProps &
  StateProps &
  AutoSizeProps & {
    onClick: (e: Event) => void,
  }

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
        <Button color="link" onClick={this.props.onClick}>
          Close detail
        </Button>
      </div>
      <ListGroup
        className="address-detail-list"
        style={{maxHeight: this.props.height - DETAILS_HEADER_HEIGHT}}
      >
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
  withHandlers({
    onClick: ({closeAddressDetail}: StateProps) => closeAddressDetail,
  }),
  withAutosize // Note: Solves auto height for entities list
)(AddressDetail)
