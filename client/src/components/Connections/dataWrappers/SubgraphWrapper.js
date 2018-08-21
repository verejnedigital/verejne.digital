// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import type {ComponentType} from 'react'
import type {ObjectMap} from '../../../types/commonTypes'
import {connectionSubgraphProvider} from '../../../dataProviders/connectionsDataProviders'
import {entityDetailProvider} from '../../../dataProviders/sharedDataProviders'
import {allEntityDetailsSelector} from '../../../selectors'
import {addEdgeIfMissing} from '../components/graph/utils'
import type {
  State,
  NewEntityDetail,
  RelatedEntity,
  Graph,
  GraphId,
  Node,
  Edge,
} from '../../../state'
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

type RawNode = {
  eid: number,
  entity_name: string,
  distance_from_A: number,
  distance_from_B: number,
}
type RawEdge = [number, number]

function findGroup(data: NewEntityDetail) {
  const politician = false // no data in new API yet // isPolitician(data)
  const withContracts = data.notices && data.notices.count > 0
  return politician && withContracts
    ? 'politContracts'
    : politician
      ? 'politician'
      : withContracts
        ? 'contracts'
        : 'normal'
}

function bold(makeBold: boolean, str: string) {
  return makeBold ? `*${str}*` : str
}

function enhanceGraph(
  {nodes: oldNodes, edges: oldEdges, nodeIds}: Graph,
  entityDetails: ObjectMap<NewEntityDetail>,
  primaryConnEids: Array<number>
) {
  const edges = oldEdges.map(({from, to}) => ({
    from,
    to,
    // primary edges (corresponding to the 1 shortest connection found) are wider
    width: primaryConnEids.indexOf(from) !== -1 && primaryConnEids.indexOf(to) !== -1 ? 5 : 1,
  }))

  // adds entity info to graph
  const nodes = oldNodes.map(({id, label, x, y, ...props}) => {
    if (!entityDetails[id.toString()]) {
      return {id, label, group: 'notLoaded', x, y, ...props}
    }
    const entity = entityDetails[id.toString()]
    const poi = props.distA === 0 || props.distB === 0
    if (props.leaf && entity.related.length) {
      // add more edges to this leaf if available, then mark as non-leaf
      entity.related.forEach(({eid}: RelatedEntity) => {
        if (nodeIds[eid]) {
          addEdgeIfMissing(id, eid, edges)
        }
      })
    }
    return {
      // delete x, y to prevent jumping on node load
      ...props,
      id,
      label: bold(poi, `${entity.name} (${entity.related.length})`),
      value: entity.related.length,
      group: findGroup(entity),
      shape: poi ? 'box' : (entity.companyinfo || {}).terminated_on ? 'diamond' : 'dot',
      leaf: false,
    }
  })
  return {nodes, edges, nodeIds}
}

function transformRaw(rawGraph: {vertices: Array<RawNode>, edges: Array<RawEdge>}): Graph {
  // transforms graph data for react-graph-vis
  const {vertices: rawNodes, edges: rawEdges} = rawGraph
  const nodes: Array<Node> = []
  const edges: Array<Edge> = []
  const nodeIds: {[GraphId]: boolean} = {}

  rawNodes.forEach((n: RawNode) => {
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

  rawEdges.forEach(([from, to]: RawEdge) => {
    nodeIds[from] && nodeIds[to] && edges.push({from, to})
  })

  return {nodes, edges, nodeIds}
}

const ConnectionWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: SubgraphProps) =>
    isNil(props.subgraph) ? null : <WrappedComponent {...props} />

  return branch(
    ({entity1, entity2}: EntityProps) => entity1.eids.length > 0 && entity2.eids.length > 0,
    compose(
      withDataProviders(({entity1, entity2}: EntityProps) => [
        connectionSubgraphProvider(entity1.eids, entity2.eids, transformRaw),
      ]),
      // TODO extract selectors
      connect((state: State, props: EntityProps & ConnectionProps) => ({
        selectedEids: state.connections.selectedEids,
        subgraph: enhanceGraph(
          state.connections.subgraph[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`]
            .data,
          allEntityDetailsSelector(state),
          props.connections
        ),
        entityDetails: allEntityDetailsSelector(state),
      })),
      branch(
        ({preloadNodes, subgraph}: OwnProps & SubgraphProps) => subgraph != null && preloadNodes,
        withDataProviders(({subgraph}: SubgraphProps) =>
          subgraph.nodes.map(({id}: Node) => entityDetailProvider(id, false))
        )
      )
    )
  )(wrapped)
}

export default ConnectionWrapper
