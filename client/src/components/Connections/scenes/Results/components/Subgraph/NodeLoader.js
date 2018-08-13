// @flow
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'

export type OwnProps = {
  eid: string,
}

// Empty component used to preload node details shown by graph.
// TODO: Ideas about a nicer solution?
const NodeLoader = () => null

export default withDataProviders((props: OwnProps) => [connectionEntityDetailProvider(props.eid)])(
  NodeLoader
)
