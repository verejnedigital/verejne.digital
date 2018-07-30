// @flow

export type Id = number | string

export type Node = {
  id: Id,
  label: string,
}
export type Edge = {
  from: Id,
  to: Id,
}
export type Graph = {|
  nodes: Array<Node>,
  edges: Array<Edge>,
  nodeIds: {[Id]: boolean},
|}
export type Point = {|
  x: number,
  y: number,
|}

// TODO read this from sass variables:
const variables = {
  blueColor: '#0062db',
  orangeColor: '#e55600',
  grayColor: '#6c8294',
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
    // smooth: {type: 'continuous'},
  },
  groups: {
    notLoaded: {
      shapeProperties: {borderDashes: [5, 5]},
    },
    normal: {
      shapeProperties: {borderDashes: false},
    },
    contracts: {
      color: {border: variables.blueColor, highlight: {border: variables.blueColor}},
      borderWidth: 5,
      shapeProperties: {borderDashes: false},
    },
    politician: {
      color: {border: variables.orangeColor, highlight: {border: variables.orangeColor}},
      font: {color: variables.orangeColor},
      borderWidth: 5,
      shapeProperties: {borderDashes: false},
      // shape: 'icon',
      //           icon: {
      //               face: 'FontAwesome',
      //               code: '\uf1ad',
      //           }
    },
    politContracts: {
      color: {
        background: variables.orangeColor,
        border: variables.orangeColor,
        highlight: {background: variables.orangeColor, border: variables.orangeColor},
      },
      font: {color: variables.orangeColor},
      borderWidth: 5,
      shapeProperties: {borderDashes: false},
    },
  },
  interaction: {
    hover: false,
    multiselect: true,
  },
  nodes: {
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
    labelHighlightBold: false,
    shape: 'dot',
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.5)',
      size: 30,
      x: 0,
      y: 0,
    },
    scaling: {
      // customScalingFunction: (min, max, total, value) => {
      //   return value / total
      // },
      min: 10,
      max: 50,
    },
    chosen: {
      // selected nodes have shadow
      label: false,
      node: (values: {}, id: Id, selected: boolean, hovering: boolean) => {
        values.shadow = true
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

const randomInt = (min, max) => {
  // returns int in (-max, -min) + (min, max)
  return (min + Math.floor(Math.random() * (max - min))) * (Math.random() < 0.5 ? -1 : 1)
}

// hack: extract eID (id) of a given node via converting it to a string
export const getNodeEid = (node: Node) => {
  return parseInt(node.toString(), 10)
}

// add (undirected) edge a<->b to edges if not yet present
export const addEdgeIfMissing = (a: Id, b: Id, edges: Array<Edge>) => {
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
  neighbours: Array<{eid: number, name: string}>
) => {
  // Update graph with new neighbours
  const nodes = graph.nodes.slice()
  const edges = graph.edges.slice()
  const {...nodeIds} = graph.nodeIds
  neighbours.forEach(({eid, name}) => {
    if (!nodeIds[eid]) {
      nodes.push({
        id: eid,
        label: name,
        leaf: true,
        x: sourcePoint.x + randomInt(20, 100),
        y: sourcePoint.y + randomInt(20, 100),
      })
      nodeIds[eid] = true
    }
    addEdgeIfMissing(eid, sourceEid, edges)
  })
  return {nodes, edges, nodeIds}
}

export const removeNodes = (graph: Graph, idsToRemove: Array<Id>, alsoRemoveOrphans: boolean) => {
  // Update graph by removing nodes
  const possibleOrphans: {[Id]: boolean} = {} // siblings of removed nodes
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
    idsToRemove = idsToRemove.concat(Object.keys(possibleOrphans).map((id) => parseInt(id, 10)))
  }

  const nodes = graph.nodes.filter(({id}) => idsToRemove.indexOf(id) === -1)
  const {...nodeIds} = graph.nodeIds
  idsToRemove.forEach((id) => {
    delete nodeIds[id]
  })
  return {nodes, edges, nodeIds}
}
