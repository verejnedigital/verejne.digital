// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil, chunk} from 'lodash'
import type {ComponentType} from 'react'
import type {ObjectMap} from '../../../types/commonTypes'
import {
  connectionSubgraphProvider,
  notableConnectionSubgraphProvider,
} from '../../../dataProviders/connectionsDataProviders'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import {allEntityDetailsSelector} from '../../../selectors'
import {enhanceGraph, transformRaw} from '../components/graph/utils'
import type {
  State,
  NewEntityDetail,
  Graph,
} from '../../../state'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../constants'
import type {EntityProps} from './EntityWrapper'
import type {ConnectionProps} from './ConnectionWrapper'

export type OwnProps = {
  preloadNodes: boolean,
}

export type SubgraphProps = {
  selectedEids: Array<number>,
  subgraph: Graph,
  entityDetails: ObjectMap<NewEntityDetail>,
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: SubgraphProps) =>
    isNil(props.subgraph) ? null : <WrappedComponent {...props} />

  return compose(
    withDataProviders(({entity1, entity2}: EntityProps) => [
      entity2.query.length > 0
        ? connectionSubgraphProvider(entity1.eids, entity2.eids, transformRaw)
        : notableConnectionSubgraphProvider(entity1.eids, transformRaw),
    ]),
    // TODO extract selectors
    connect((state: State, props: EntityProps & ConnectionProps) => ({
      selectedEids: state.connections.selectedEids,
      subgraph: enhanceGraph(
        (props.entity2.query.length > 0
          ? state.connections.subgraph[
            `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
          ]
          : state.connections.subgraph[`${props.entity1.eids.join()}`]
        ).data,
        allEntityDetailsSelector(state),
        props.connections
      ),
      entityDetails: allEntityDetailsSelector(state),
    })),
    branch(
      ({preloadNodes, subgraph}: OwnProps & SubgraphProps) => subgraph != null && preloadNodes,
      withDataProviders(({subgraph: {nodes}}: SubgraphProps) =>
        chunk(nodes.map(({id}) => id), MAX_ENTITY_REQUEST_COUNT).map((ids) =>
          entityDetailProvider(ids, false)
        )
      )
    )
  )(wrapped)
}

export default ConnectionWrapper
