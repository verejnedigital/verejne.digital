// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {updateValue} from '../../../../../../actions/sharedActions'
import SubgraphWrapper from '../../../../dataWrappers/SubgraphWrapper'
import GraphCompnent from 'react-graph-vis'
import {Col, Row} from 'reactstrap'
import InfoLoader from './InfoLoader'
import NodeLoader from './NodeLoader'
import {updateValue} from '../../../actions/sharedActions'
import SubgraphWrapper from '../dataWrappers/SubgraphWrapper'
import {options as graphOptions, getNodeEid, addNeighbours, removeNodes} from './graph/utils'
import {checkShaking, resetGesture} from './graph/gestures'
import type {SubgraphProps} from '../dataWrappers/SubgraphWrapper'
import type {EntityProps} from '../dataWrappers/EntityWrapper'
import type {ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import type {GraphId, Node} from '../../../state'
import type {Point} from './graph/utils'

import './Subgraph.css'

export type GraphEvent = {|
  nodes: Array<Node>,
  edges: Array<Array<GraphId>>,
  event: Event,
  pointer: {
    DOM: Point,
    canvas: Point,
  },
  previousSelection: {
    nodes: Array<Node>,
    edges: Array<Array<GraphId>>,
  },
|}

export type OwnProps = {
  preloadNodes: boolean,
} & EntityProps &
  ConnectionProps

type DispatchProps = {
  updateValue: Function,
}
type Handlers = {
  handleSelect: (e: GraphEvent) => void,
  handleDoubleClick: (e: GraphEvent) => void,
  handleDrag: (e: GraphEvent) => void,
  handleDragEnd: (e: GraphEvent) => void,
}

type Props = OwnProps & SubgraphProps & DispatchProps & Handlers

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
        label: 'Údaje sa\nnačítavaju',
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
  preloadNodes = true,
  handleSelect,
  handleDoubleClick,
  handleDrag,
  handleDragEnd,
}: Props) => {
  return (
    <div className="subgraph">
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
                <li>Potrasenie vrcholom: odobrať vrchol z grafu (aj jeho výlučných susedov)</li>
              </ul>
            </Col>
            <Col lg="7" md="12">
              <div className="graph graph-legend">
                <GraphCompnent graph={legendGraph} options={graphOptions} style={legendStyle} />
              </div>
            </Col>
          </Row>
          <div className="graph">
            <GraphCompnent
              graph={subgraph}
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
          {preloadNodes && subgraph.nodes.map(({id}) => <NodeLoader key={id} eid={id} />)}
          {selectedEids.map((eid) => <InfoLoader key={eid} eid={eid} />)}
        </div>
      }
    </div>
  )
}

export default compose(
  connect(null, {updateValue}),
  SubgraphWrapper,
  withHandlers({
    handleSelect: (props: OwnProps & DispatchProps & SubgraphProps) => ({nodes}: GraphEvent) => {
      props.updateValue(['connections', 'selectedEids'], nodes.map(getNodeEid))
    },
    handleDoubleClick: (props: OwnProps & DispatchProps & SubgraphProps) => ({
      nodes,
      pointer,
    }: GraphEvent) => {
      if (!nodes.length) {
        return
      }
      const subgraphId = `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
      const clickedEid = getNodeEid(nodes[0]) // TODO can double click more nodes?

      if (props.entityDetails[clickedEid]) {
        const related = props.entityDetails[clickedEid].data.related
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          addNeighbours(props.subgraph, clickedEid, pointer.canvas, related)
        )
      }
    },
    handleDrag: (props: OwnProps & DispatchProps & SubgraphProps) => ({
      nodes,
      pointer,
    }: GraphEvent) => {
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
    handleDragEnd: () => () => {
      resetGesture()
    },
  })
)(Subgraph)
