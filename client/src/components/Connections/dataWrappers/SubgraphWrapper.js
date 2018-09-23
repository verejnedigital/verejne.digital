// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch} from 'recompose'
import {withDataProviders} from 'data-provider'
import {isNil} from 'lodash'
import type {ComponentType} from 'react'
import type {ObjectMap} from '../../../types/commonTypes'
import {
  connectionSubgraphProvider,
  notableConnectionSubgraphProvider,
} from '../../../dataProviders/connectionsDataProviders'
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
  query: boolean,
  distance: number,
}
type RawEdge = [number, number]

function findGroup(data: NewEntityDetail) {
  return data.political_entity
    ? 'politician'
    : data.trade_with_government && data.contact_with_politics
      ? 'politContracts'
      : data.trade_with_government
        ? 'contracts'
        : data.contact_with_politics
          ? 'politTies'
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
    width:
      primaryConnEids && primaryConnEids.indexOf(from) !== -1 && primaryConnEids.indexOf(to) !== -1
        ? 5
        : 1,
  }))

  // adds entity info to graph
  const nodes = oldNodes.map(({id, label, x, y, ...props}) => {
    if (!entityDetails[id.toString()]) {
      return {id, label, group: 'notLoaded', x, y, ...props}
    }
    const entity = entityDetails[id.toString()]
    const poi = props.is_query
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
    nodes.push({
      id: n.eid,
      label: n.entity_name,
      is_query: n.query,
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
    ({entity1, entity2}: EntityProps) => entity1.eids.length > 0,
    compose(
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
        withDataProviders(({subgraph}: SubgraphProps) =>
          subgraph.nodes.map(({id}: Node) => entityDetailProvider(id, false))
        )
      )
    )
  )(wrapped)
}

export default ConnectionWrapper
