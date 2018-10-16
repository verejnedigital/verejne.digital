// @flow
import type {GraphId, Node, Edge, Graph, RelatedEntity, NewEntityDetail} from '../../../../state'
import {orderBy} from 'lodash'
import type {ObjectMap} from '../../../../types/commonTypes'

export type Point = {|
  x: number,
  y: number,
|}

type RawNode = {
  eid: number,
  entity_name: string,
  query: boolean,
  distance: number,
}
type RawEdge = [number, number]

// TODO read this from sass variables:
const variables = {
  blueColor: '#0062db',
  orangeColor: '#e55600',
  grayColor: '#6c8294',
  purpleColor: 'purple',
  shadowColor: 'rgba(187, 198, 206, .5)',
}

export const options = {
  layout: {
    hierarchical: false,
  },
  edges: {
    arrows: {to: {enabled: false}},
    color: {color: variables.grayColor},
    hoverWidth: 0,
    width: 1,
    length: 100,
  },
  groups: {
    notLoaded: {
      shapeProperties: {borderDashes: [5, 5]},
    },
    normal: {
      shapeProperties: {borderDashes: false},
      color: {
        border: variables.blueColor,
        highlight: {border: variables.blueColor},
      },
    },
    contracts: {
      color: {
        background: variables.blueColor,
        border: variables.blueColor,
        highlight: {border: variables.blueColor},
      },
      shapeProperties: {borderDashes: false},
    },
    politician: {
      color: {
        background: variables.purpleColor,
        border: variables.purpleColor,
        highlight: {background: variables.purpleColor, border: variables.purpleColor},
      },
      font: {color: variables.purpleColor},
      shapeProperties: {borderDashes: false},
    },
    politTies: {
      color: {border: variables.orangeColor, highlight: {border: variables.orangeColor}},
      font: {color: variables.orangeColor},
      shapeProperties: {borderDashes: false},
    },
    politContracts: {
      color: {
        background: variables.orangeColor,
        border: variables.orangeColor,
        highlight: {background: variables.orangeColor, border: variables.orangeColor},
      },
      font: {color: variables.orangeColor},
      shapeProperties: {borderDashes: false},
    },
  },
  interaction: {
    hover: false,
    multiselect: true,
  },
  nodes: {
    mass: 2,
    value: 1,
    color: {
      background: 'white',
      border: variables.grayColor,
      highlight: {background: '#f2f5f8', border: variables.grayColor},
    },
    font: {
      size: 15,
      color: variables.blueColor,
      strokeWidth: 5,
      multi: 'md', // enables use of bold/italics
    },
    widthConstraint: {maximum: 150},
    borderWidth: 2,
    labelHighlightBold: false,
    shape: 'dot',
    shadow: {
      enabled: true,
      color: variables.shadowColor,
      size: 10,
      x: 0,
      y: 0,
    },
    chosen: {
      // selected nodes have shadow
      label: false,
      node: (values: {[string]: any}, id: GraphId, selected: boolean, hovering: boolean) => {
        values.shadowSize = 30
      },
    },
  },
  physics: {
    enabled: true,
    barnesHut: {
      gravitationalConstant: -3000,
      centralGravity: 0.3,
      springLength: 80,
      springConstant: 0.004,
      damping: 0.1,
      avoidOverlap: 0.01,
    },
  },
}

const randomInt = (min: number, max: number) => {
  // returns int in (-max, -min) + (min, max)
  return (min + Math.floor(Math.random() * (max - min))) * (Math.random() < 0.5 ? -1 : 1)
}

export const getNodeEid = (node: Node): GraphId => {
  // hack: extract eID (id) of a given node via converting it to a string
  return parseInt(node.toString(), 10)
}

export const addEdgeIfMissing = (a: GraphId, b: GraphId, edges: Array<Edge>) => {
  // Add (undirected) edge a<->b to edges if not yet present
  if (a === b) {
    return
  }
  if (edges.some(({from, to}) => (from === a && to === b) || (from === b && to === a))) {
    return
  }
  edges.push({from: a, to: b})
}

export const addNeighbours = (
  graph: Graph,
  sourceEid: number,
  sourcePoint: Point,
  neighbours: Array<RelatedEntity>,
  limit: number,
) => {
  // Update graph with new neighbours
  const nodes = graph.nodes.slice()
  const edges = graph.edges.slice()
  const {...nodeIds} = graph.nodeIds
  let addedCount = 0
  for (const {eid, name} of orderBy(neighbours, ['edge_types'])) {
    if (addedCount >= limit) break
    if (!nodeIds[eid]) {
      nodes.push({
        id: eid,
        label: name,
        leaf: true,
        // spawn new nodes around the source
        // they would otherwise appear in the middle of the viewport which disturbs the layout
        x: sourcePoint.x + randomInt(20, 100),
        y: sourcePoint.y + randomInt(20, 100),
        is_query: false,
      })
      nodeIds[eid] = true
      addedCount += 1
    }
    addEdgeIfMissing(eid, sourceEid, edges)
  }
  return {nodes, edges, nodeIds}
}

export const removeNodes = (
  graph: Graph,
  idsToRemove: Array<GraphId>,
  alsoRemoveOrphans: boolean
) => {
  // Update graph by removing nodes
  const possibleOrphans: {[GraphId]: boolean} = {} // siblings of removed nodes
  const edges = graph.edges.filter(({from, to}) => {
    if (idsToRemove.indexOf(from) !== -1) {
      possibleOrphans[to] = true
      return false
    }
    if (idsToRemove.indexOf(to) !== -1) {
      possibleOrphans[from] = true
      return false
    }
    return true
  })

  if (alsoRemoveOrphans) {
    edges.forEach(({from, to}) => {
      if (possibleOrphans[from]) {
        delete possibleOrphans[from]
      }
      if (possibleOrphans[to]) {
        delete possibleOrphans[to]
      }
    })
    // duplicates are not a problem
    idsToRemove = idsToRemove.concat(Object.keys(possibleOrphans).map((key) => parseInt(key, 10)))
  }

  const nodes = graph.nodes.filter(({id}) => idsToRemove.indexOf(id) === -1)
  const {...nodeIds} = graph.nodeIds
  idsToRemove.forEach((id) => {
    delete nodeIds[id]
  })
  return {nodes, edges, nodeIds}
}

export function findGroup(data: NewEntityDetail) {
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

export function bold(makeBold: boolean, str: string) {
  return makeBold ? `*${str}*` : str
}

export function enhanceGraph(
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
      return {id, label, group: 'notLoaded', shape: 'box', x, y, ...props}
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
      shape: 'infoBox',
      leaf: false,
    }
  })
  return {nodes, edges, nodeIds}
}

export function transformRaw(rawGraph: {vertices: Array<RawNode>, edges: Array<RawEdge>}): Graph {
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
      shape: 'infoBox',
    })
    nodeIds[n.eid] = true
  })

  rawEdges.forEach(([from, to]: RawEdge) => {
    nodeIds[from] && nodeIds[to] && edges.push({from, to})
  })

  return {nodes, edges, nodeIds}
}
