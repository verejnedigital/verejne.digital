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
import {
  allEntityDetailsSelector,
  subgraphSelectedEidsSelector,
  subgraphSelector,
} from '../../../selectors'
import {enhanceGraph, transformRaw} from '../components/graph/utils'
import type {
  State,
  NewEntityDetail,
  Graph,
} from '../../../state'
import {MAX_ENTITY_REQUEST_COUNT} from '../../../constants'
import type {ConnectionProps} from './ConnectionWrapper'

export type SubgraphProps = {
  subgraph: Graph,
  eids1: Array<number>,
  eids2: Array<number>,
  entityDetails: ObjectMap<NewEntityDetail>,
  selectedEids: Array<number>,
  notable: boolean,
  preloadNodes: boolean,
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: SubgraphProps) =>
    isNil(props.subgraph) ? null : <WrappedComponent {...props} />

  return compose(
    withDataProviders(({eids1, eids2, notable}: SubgraphProps) => [
      notable
        ? notableConnectionSubgraphProvider(eids1, transformRaw)
        : connectionSubgraphProvider(eids1, eids2, transformRaw),
    ]),
    // TODO extract selectors
    connect((state: State, props: SubgraphProps & ConnectionProps) => ({
      selectedEids: subgraphSelectedEidsSelector(state),
      subgraph: enhanceGraph(
        (props.notable
          ? subgraphSelector(state, `${props.eids1.join()}`)
          : subgraphSelector(state, `${props.eids1.join()}-${props.eids2.join()}`)
        ).data,
        allEntityDetailsSelector(state),
        props.connections
      ),
      entityDetails: allEntityDetailsSelector(state),
    })),
    branch(
      ({preloadNodes, subgraph}: SubgraphProps) => subgraph != null && preloadNodes,
      withDataProviders(({subgraph: {nodes}}: SubgraphProps) =>
        chunk(nodes.map(({id}) => id), MAX_ENTITY_REQUEST_COUNT).map((ids) =>
          entityDetailProvider(ids, false)
        )
      )
    )
  )(wrapped)
}

export default ConnectionWrapper
