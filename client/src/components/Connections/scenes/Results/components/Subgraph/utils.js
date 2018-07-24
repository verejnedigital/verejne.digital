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
    contracts: {
      color: {border: variables.blueColor, highlight: {border: variables.blueColor}},
      borderWidth: 5,
    },
    politician: {
      color: {border: variables.orangeColor, highlight: {border: variables.orangeColor}},
      font: {color: variables.orangeColor},
      borderWidth: 5,
      // shape: 'icon',
      //           icon: {
      //               face: 'FontAwesome',
      //               code: '\uf1ad',
      //           }
    },
    politContracts: {
      color: {background: variables.orangeColor, border: variables.orangeColor,
        highlight: {background: variables.orangeColor, border: variables.orangeColor}},
      font: {color: variables.orangeColor},
      borderWidth: 5,
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
    chosen: { // selected nodes have shadow
      label: false,
      node: (values, id, selected, hovering) => {
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

// hack: extract eID (id) of a given node via converting it to a string
export const getNodeEid = (node) => {
  return parseInt(node.toString(), 10)
}

// add (undirected) edge a<->b to edges if not yet present
export const addEdgeIfMissing = (a, b, edges) => {
  if (a === b) {
    return
  }
  if (edges.some(({from, to}) => ((from === a && to === b) || (from === b && to === a)))) {
    return
  }
  edges.push({from: a, to: b})
}

export const addNeighbours = (graph, sourceEid, neighbours) => {
  // Update graph with new neighbours
  const nodes = graph.nodes.slice()
  const edges = graph.edges.slice()
  const {...nodeIds} = graph.nodeIds
  neighbours.forEach(({eid, name}) => {
    if (!nodeIds[eid]) {
      nodes.push({id: eid, label: name})
      nodeIds[eid] = true
    }
    addEdgeIfMissing(eid, sourceEid, edges)
  })
  return {nodes, edges, nodeIds}
}

export const transformRaw = (rawGraph) => {
  // transforms graph data for react-graph-vis
  const {vertices: rawNodes, edges: rawEdges} = rawGraph
  const nodes = [], edges = []
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
    nodeIds[from] && nodeIds[to] && addEdgeIfMissing(from, to, edges)
  })

  return {nodes, edges, nodeIds}
}
