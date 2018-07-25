// @flow
import {compose} from 'redux'
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'

const NodeLoader = () => (
  null
)

export default compose(
  withDataProviders((props) => [connectionEntityDetailProvider(props.eid)]),
)(NodeLoader)
