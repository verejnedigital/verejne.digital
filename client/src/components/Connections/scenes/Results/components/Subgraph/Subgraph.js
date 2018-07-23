import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {updateValue} from '../../../../../../actions/sharedActions'
import InfoLoader from '../InfoLoader/InfoLoader'
import {connectionSubgraphProvider} from '../../../../../../dataProviders/connectionsDataProviders'
import {cloneDeep} from 'lodash'

import Graph from 'react-graph-vis'

import './Subgraph.css'

const options = {
  layout: {
    hierarchical: false,
  },
  edges: {
    arrows: {to: {enabled: false}},
    color: '#000000',
    hoverWidth: 0,
  },
  groups: {
    source: {
      color: {background: '#337ab7', border: '#245580', highlight: {background: '#337ab7', border: '#245580'}},
      font: {color: '#ffffff'},
    },
    target: {
      color: {background: '#337ab7', border: '#245580', highlight: {background: '#337ab7', border: '#245580'}},
      font: {color: '#ffffff'},
    },
  },
  interaction: {
    hover: false,
    multiselect: true,
  },
  nodes: {
    color: {
      background: 'white',
      border: '#cddae3',
      highlight: {background: '#f2f5f8', border: '#cddae3'}
    },
    font: {size: 15, color: '#0062db'},
    labelHighlightBold: false,
    shape: 'box',
    shapeProperties: {borderRadius: 4},
  },
  physics: {
    enabled: true,
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.3,
      springLength: 90,
      springConstant: 0.004,
      damping: 0.09,
      avoidOverlap: 0.001,
    },
  },
}
const style = {
  width: '100%',
  height: '600px',
}

// add (undirected) edge a<->b to edges if not yet present
function addEdgeIfMissing(a, b, edges) {
  if (a === b) {
    return
  }
  if (edges.some(({from, to}) => ((from === a && to === b) || (from === b && to === a)))) {
    return
  }
  edges.push({from: a, to: b})
}

// hack: extract eID (id) of a given node via converting it to a string
function getNodeEid(node) {
  return parseInt(node.toString(), 10)
}

function addNeighbours(graph, sourceEid, neighbours) {
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

function graphTransformer(rawGraph) {
  // transforms graph data for react-graph-vis
  const {vertices: rawNodes, edges: rawEdges} = rawGraph
  const nodes = [], edges = []
  const nodeIds = {}

  rawNodes.forEach(({eid, entity_name: label, distance_from_A: distA, distance_from_B: distB}) => {
    // skip nodes that are not connected to the other end
    if (distA == null || distB == null) {
      return
    }
    // add node to the graph, with special groups for the source and target nodes
    if (distA === 0) {
      nodes.push({id: eid, label, group: 'source', x: 0.0})
    } else if (distB === 0) {
      nodes.push({id: eid, label, group: 'target', x: 150.0 * distA})
    } else {
      nodes.push({id: eid, label})
    }
    nodeIds[eid] = true
  })

  rawEdges.forEach(([from, to]) => {
    nodeIds[from] && nodeIds[to] && addEdgeIfMissing(from, to, edges)
  })

  return {nodes, edges, nodeIds}
}

const Subgraph = ({subgraph, selectedEids, handleSelect, handleNodeDoubleClick}) => {
  return (
    <div className="subgraph">
      {/*loading ? (
        'Prebieha načítavanie grafu ...'
      ) :*/}
      {(
        <div>
          Ovládanie:
          <ul>
            <li>Ťahanie vrchola: premiestnenie vrchola v grafe</li>
            <li>Klik na vrchol: zobraziť detailné informácie o vrchole (v boxe pod grafom)</li>
            <li>Dvojklik na vrchol: pridať do grafu nezobrazených susedov</li>
          </ul>
          <div className="graph">
            <Graph
              graph={cloneDeep(subgraph)}
              options={options}
              events={{
                select: handleSelect,
                doubleClick: handleNodeDoubleClick,
              }}
              style={style}
            />
          </div>
          {selectedEids.map((eid) => <InfoLoader key={eid} eid={eid} />)}
        </div>
      )}
    </div>
  )
}

export default compose(
  withDataProviders((props) => [
    connectionSubgraphProvider(props.entity1.eids.join(), props.entity2.eids.join(), graphTransformer),
  ]),
  connect(
    (state, props) => ({
      selectedEids: state.connections.selectedEids,
      subgraph: state.connections.subgraph[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`].data,
      entityDetails: state.connections.entityDetails, // TODO better way to access this?
    }),
    {updateValue}
  ),
  withHandlers({
    handleSelect: (props) => (e) => {
      props.updateValue(['connections', 'selectedEids'], e.nodes.map(getNodeEid))
    },
    handleNodeDoubleClick: (props) => (e) => {
      const subgraphId = `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
      const clickedEid = getNodeEid(e.nodes)// TODO if more nodes?
      
      if (props.entityDetails[clickedEid]) { // TODO rethink
        const related = props.entityDetails[clickedEid].data.related
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          addNeighbours(props.subgraph, clickedEid, related)
        )
      }
    },
  })
)(Subgraph)
