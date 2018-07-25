// TODO flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {withDataProviders} from 'data-provider'
import {updateValue} from '../../../../../../actions/sharedActions'
import InfoLoader from '../InfoLoader/InfoLoader'
import NodeLoader from './NodeLoader'
import {isPolitician} from '../../../../../Notices/utilities'
import {connectionSubgraphProvider} from '../../../../../../dataProviders/connectionsDataProviders'
import {Col, Row} from 'reactstrap'
import {options as graphOptions, getNodeEid, addNeighbours, transformRaw} from './utils'
import Graph from 'react-graph-vis'

import './Subgraph.css'

const legendStyle = {
  width: '100%',
  height: '120px',
}
const graphStyle = {
  width: '100%',
  height: '600px',
}

const x = 10, y = 10, step = 140
const legendGraph = {
  nodes: [
    {id: '1', x, y, label: 'Firma/Osoba\n(počet prepojení)', fixed: true, physics: false},
    {id: '2', x: x + step, y, label: 'Obchod so štátom', group: 'contracts', fixed: true, physics: false},
    {id: '3', x: x + 2 * step, y, label: 'Kontakt s politikou', group: 'politician', fixed: true, physics: false},
    {id: '4', x: x + 3 * step, y, label: 'Kontakt s politikou\na obchod so štátom', group: 'politContracts', fixed: true, physics: false},
    {id: '5', x: x + 4 * step, y, label: 'Nenačítané údaje\nklikni pre načítanie', group: 'notLoaded', fixed: true, physics: false},
    {id: '6', x: x + 5 * step, y, label: 'Zaniknutá', shape: 'diamond', fixed: true, physics: false},
  ],
  edges: [],
}

function findGroup(data) {
  const politician = isPolitician(data)
  const withContracts = data.total_contracts && data.total_contracts > 0
  return politician && withContracts ? 'politContracts' : //
    politician ? 'politician' : //
      withContracts ? 'contracts' : undefined
}

function bold(condition, str) {
  return condition ? `*${str}*` : str
}

function enhanceGraph({nodes: oldNodes, edges: oldEdges}, entityDetails, primaryConnEids) {
  // adds entity info to graph
  const nodes = oldNodes.map(({id, label, ...props}) => {
    if (!entityDetails[id]) {
      return {id, label, group: 'notLoaded', ...props}
    }
    const data = entityDetails[id].data
    const entity = data.entities[0]
    const poi = props.distA === 0 || props.distB === 0
    return {
      id,
      label: bold(poi, `${entity.entity_name} (${data.related.length})`),
      value: data.related.length,
      group: findGroup(data),
      shape: poi ? 'box' : (data.company_stats[0] || {}).datum_zaniku ? 'diamond' : 'dot',
      shapeProperties: {borderDashes: false},
      ...props,
    }
  })
  const edges = oldEdges.map(({from, to}) => ({
    from,
    to,
    width: primaryConnEids.indexOf(from) !== -1 && primaryConnEids.indexOf(to) !== -1 ? 5 : 1,
  }))
  return {nodes, edges}
}

function enhanceDrawing(ctx) {
  // const nodeId = 616705//subgraph.nodes[0].id
  // const nodePosition = this.getPositions([nodeId])
  // ctx.strokeStyle = '#A6D5F7'
  // ctx.fillStyle = '#294475'
  // ctx.circle(nodePosition[nodeId].x, nodePosition[nodeId].y, 5)
  // ctx.fill()
  // ctx.stroke()
}

const Subgraph = ({subgraph, selectedEids, entityDetails, connections, handleSelect, handleDoubleClick}) => {
  const enhancedGraph = enhanceGraph(subgraph, entityDetails, connections)
  return (
    <div className="subgraph">
      {/*loading ? (
        'Prebieha načítavanie grafu ...'
      ) :*/}
      {(
        <div>
          <Row>
            <Col lg="5" md="12">
              Ovládanie:
              <ul>
                <li>Ťahanie vrchola: premiestnenie vrchola v grafe</li>
                <li>Klik na vrchol: načítať a zobraziť detailné informácie o vrchole (v boxe pod grafom)</li>
                <li>Dvojklik na vrchol: pridať do grafu nezobrazených susedov</li>
              </ul>
            </Col>
            <Col lg="7" md="12">
              <div className="graph graph-legend">
                <Graph
                  graph={legendGraph}
                  options={graphOptions}
                  style={legendStyle}
                />
              </div>
            </Col>
          </Row>
          <div className="graph">
            <Graph
              graph={enhancedGraph}
              options={graphOptions}
              events={{
                select: handleSelect,
                doubleClick: handleDoubleClick,
                afterDrawing: enhanceDrawing,
              }}
              style={graphStyle}
            />
          </div>
          {subgraph.nodes.map(({id}) => <NodeLoader key={id} eid={id} />)}
          {selectedEids.map((eid) => <InfoLoader key={eid} eid={eid} />)}
        </div>
      )}
    </div>
  )
}

export default compose(
  withDataProviders((props) => [
    connectionSubgraphProvider(props.entity1.eids.join(), props.entity2.eids.join(), transformRaw),
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
    handleSelect: (props) => ({nodes}) => {
      props.updateValue(['connections', 'selectedEids'], nodes.map(getNodeEid))
    },
    handleDoubleClick: (props) => ({nodes}) => {
      const subgraphId = `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
      const clickedEid = getNodeEid(nodes)// TODO can double click more nodes?

      if (props.entityDetails[clickedEid]) {
        const related = props.entityDetails[clickedEid].data.related
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          addNeighbours(props.subgraph, clickedEid, related)
        )
      }
    },
  })
)(Subgraph)
