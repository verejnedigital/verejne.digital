// @flow
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
import {
  options as graphOptions,
  getNodeEid,
  addNeighbours,
  removeNodes,
  transformRaw,
} from './utils'
import {checkShaking, resetGesture} from './gestures'
import Graph from 'react-graph-vis'

import type {State, Company, SearchedEntity} from '../../../../../../state'
import type {Id, Graph as GraphType, Node, Point} from './utils'

import './Subgraph.css'

export type GraphEvent = {|
  nodes: Array<Node>,
  edges: Array<Array<Id>>,
  event: Event,
  pointer: {
    DOM: Point,
    canvas: Point,
  },
  previousSelection: {
    nodes: Array<Node>,
    edges: Array<Array<Id>>,
  },
|}

type EntityDetails = {
  // TODO import from state probably
  [string]: {
    name: string,
    data: Company,
  },
}

export type SubgraphProps = {
  subgraph: GraphType,
  selectedEids: Array<number>,
  connections: Array<number>,
  entityDetails: EntityDetails,
  entity1: SearchedEntity,
  entity2: SearchedEntity,
  updateValue: Function,
  handleSelect: (e: GraphEvent) => void,
  handleDoubleClick: (e: GraphEvent) => void,
  handleDrag: (e: GraphEvent) => void,
  handleDragEnd: (e: GraphEvent) => void,
}

const legendStyle = {
  width: '100%',
  height: '120px',
}
const graphStyle = {
  width: '100%',
  height: '600px',
}

const legendGraph = (() => {
  const x = 10
  const y = 10
  const step = 140
  return {
    nodes: [
      {
        id: '1',
        x,
        y,
        label: 'Firma/Osoba\n(počet prepojení)',
        fixed: true,
        physics: false,
      },
      {
        id: '2',
        x: x + step,
        y,
        label: 'Obchod so štátom',
        group: 'contracts',
        fixed: true,
        physics: false,
      },
      {
        id: '3',
        x: x + 2 * step,
        y,
        label: 'Kontakt s politikou',
        group: 'politician',
        fixed: true,
        physics: false,
      },
      {
        id: '4',
        x: x + 3 * step,
        y,
        label: 'Kontakt s politikou\na obchod so štátom',
        group: 'politContracts',
        fixed: true,
        physics: false,
      },
      {
        id: '5',
        x: x + 4 * step,
        y,
        label: 'Nenačítané údaje\nklikni pre načítanie',
        group: 'notLoaded',
        fixed: true,
        physics: false,
      },
      {
        id: '6',
        x: x + 5 * step,
        y,
        label: 'Zaniknutá',
        shape: 'diamond',
        fixed: true,
        physics: false,
      },
    ],
    edges: [],
  }
})()

function findGroup(data: Company) {
  const politician = isPolitician(data)
  const withContracts = data.total_contracts && data.total_contracts > 0
  return politician && withContracts
    ? 'politContracts'
    : politician
      ? 'politician'
      : withContracts
        ? 'contracts'
        : undefined
}

function bold(makeBold: boolean, str: string) {
  return makeBold ? `*${str}*` : str
}

function enhanceGraph(
  {nodes: oldNodes, edges: oldEdges}: GraphType,
  entityDetails: EntityDetails,
  primaryConnEids: Array<number>
) {
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

function enhanceDrawing(/*ctx*/) {
  // const nodeId = 616705//subgraph.nodes[0].id
  // const nodePosition = this.getPositions([nodeId])
  // ctx.strokeStyle = '#A6D5F7'
  // ctx.fillStyle = '#294475'
  // ctx.circle(nodePosition[nodeId].x, nodePosition[nodeId].y, 5)
  // ctx.fill()
  // ctx.stroke()
}

const Subgraph = ({
  subgraph,
  selectedEids,
  entityDetails,
  connections,
  handleSelect,
  handleDoubleClick,
  handleDrag,
  handleDragEnd,
}: SubgraphProps) => {
  const enhancedGraph = enhanceGraph(subgraph, entityDetails, connections)
  return (
    <div className="subgraph">
      {/*loading ? (
        'Prebieha načítavanie grafu ...'
      ) :*/}
      {
        <div>
          <Row>
            <Col lg="5" md="12">
              Ovládanie:
              <ul>
                <li>Ťahanie vrchola: premiestnenie vrchola v grafe</li>
                <li>
                  Klik na vrchol: načítať a zobraziť detailné informácie o vrchole (v boxe pod
                  grafom)
                </li>
                <li>Dvojklik na vrchol: pridať do grafu nezobrazených susedov</li>
                <li>Potrasenie vrcholom: odobrať vrchol z grafu</li>
              </ul>
            </Col>
            <Col lg="7" md="12">
              <div className="graph graph-legend">
                <Graph graph={legendGraph} options={graphOptions} style={legendStyle} />
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
                dragging: handleDrag,
                dragEnd: handleDragEnd,
                afterDrawing: enhanceDrawing,
              }}
              style={graphStyle}
            />
          </div>
          {subgraph.nodes.map(({id}) => <NodeLoader key={id} eid={id} />)}
          {selectedEids.map((eid) => <InfoLoader key={eid} eid={eid} />)}
        </div>
      }
    </div>
  )
}

export default compose(
  withDataProviders((props: SubgraphProps) => [
    connectionSubgraphProvider(props.entity1.eids.join(), props.entity2.eids.join(), transformRaw),
  ]),
  connect(
    (state: State, props: SubgraphProps) => ({
      selectedEids: state.connections.selectedEids,
      subgraph:
        state.connections.subgraph[`${props.entity1.eids.join()}-${props.entity2.eids.join()}`]
          .data,
      entityDetails: state.connections.entityDetails, // TODO better way to access this?
    }),
    {updateValue}
  ),
  withHandlers({
    handleSelect: (props: SubgraphProps) => ({nodes}: GraphEvent) => {
      props.updateValue(['connections', 'selectedEids'], nodes.map(getNodeEid))
    },
    handleDoubleClick: (props: SubgraphProps) => ({nodes}: GraphEvent) => {
      const subgraphId = `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
      const clickedEid = getNodeEid(nodes) // TODO can double click more nodes?

      if (props.entityDetails[clickedEid]) {
        const related = props.entityDetails[clickedEid].data.related
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          addNeighbours(props.subgraph, clickedEid, related)
        )
      }
    },
    handleDrag: (props: SubgraphProps) => ({nodes, pointer}: GraphEvent) => {
      if (!nodes.length) {
        return
      }
      if (checkShaking(pointer.canvas)) {
        const subgraphId = `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          removeNodes(props.subgraph, nodes.map(getNodeEid), true)
        )
        props.updateValue(['connections', 'selectedEids'], [])
      }
    },
    handleDragEnd: (props) => () => {
      resetGesture()
    },
  })
)(Subgraph)
