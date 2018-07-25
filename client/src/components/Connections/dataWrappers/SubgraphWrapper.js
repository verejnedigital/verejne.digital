// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import type {ComponentType} from 'react'
import {connectionSubgraphProvider} from '../../../dataProviders/connectionsDataProviders'

import type {State} from '../../../state'

function transformRaw(rawGraph: {vertices: Array<{}>, edges: Array<Array<number>>}) {
  // transforms graph data for react-graph-vis
  const {vertices: rawNodes, edges: rawEdges} = rawGraph
  const nodes = []
  const edges = []
  const nodeIds = {}

  rawNodes.forEach((n) => {
    // skip nodes that are not connected to the other end
    if (n.distance_from_A == null || n.distance_from_B == null) {
      return
    }
    nodes.push({
      id: n.eid,
      label: n.entity_name,
      distA: n.distance_from_A,
      distB: n.distance_from_B,
    })
    nodeIds[n.eid] = true
  })

  rawEdges.forEach(([from, to]) => {
    nodeIds[from] && nodeIds[to] && edges.push({from, to})
  })

  return {nodes, edges, nodeIds}
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props) => (isNil(props.subgraph) ? null : <WrappedComponent {...props} />)

  return compose(
    withDataProviders((props) => [
      connectionSubgraphProvider(
        props.entity1.eids.join(),
        props.entity2.eids.join(),
        transformRaw
      ),
    ]),
    connect((state: State, props) => ({
      selectedEids: state.connections.selectedEids,
      subgraph: props.enhanceGraph(
        state.connections.subgraph[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`]
          .data,
        state.connections.entityDetails,
        props.connections
      ),
      entityDetails: state.connections.entityDetails,
    }))
  )(wrapped)
}

export default ConnectionWrapper
