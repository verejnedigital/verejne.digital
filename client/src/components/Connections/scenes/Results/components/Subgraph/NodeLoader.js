// @flow
import {withDataProviders} from 'data-provider'
import {connectionEntityDetailProvider} from '../../../../../../dataProviders/connectionsDataProviders'

export type NodeLoaderProps = {
  eid: number,
}

const NodeLoader = () => null

export default withDataProviders((props: NodeLoaderProps) => [
  connectionEntityDetailProvider(props.eid),
])(NodeLoader)
