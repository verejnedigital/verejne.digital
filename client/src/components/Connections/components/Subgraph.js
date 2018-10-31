// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import GraphCompnent from 'react-graph-vis'
import {addNeighboursLimitSelector} from '../../../selectors'
import CompanyDetails from './../../shared/CompanyDetails'
import {updateValue} from '../../../actions/sharedActions'
import SubgraphWrapper from '../dataWrappers/SubgraphWrapper'
import {options as graphOptions, getNodeEid, addNeighbours, removeNodes, getSubgraphId} from './graph/utils'
import {checkShaking, resetGesture} from './graph/gestures'
import type {SubgraphProps} from '../dataWrappers/SubgraphWrapper'
import type {ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import type {GraphId, Node, State} from '../../../state'
import type {Point} from './graph/utils'
import {ADD_NEIGHBOURS_LIMIT} from '../../../constants'
import Legend from '../../shared/Legend/Legend'

import './Subgraph.css'
import './InfoLoader.css'

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
  limit: number,
} & ConnectionProps

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

const graphStyle = {
  width: '100%',
  height: '600px',
}

// Subgraph requires notable and eids1, if notable is false, also eids2
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
}: Props) => (
  <div className="subgraph">
    <div className="graph mt-1">
      <GraphCompnent
        graph={subgraph}
        options={graphOptions}
        events={{
          select: handleSelect,
          doubleClick: handleDoubleClick,
          dragging: handleDrag,
          dragEnd: handleDragEnd,
        }}
        style={graphStyle}
      />
    </div>
    <Legend defaultOpen={false} closable graphControls />
    {selectedEids.map((eid) => (
      <div className="info-loader" key={eid}>
        <CompanyDetails eid={eid} />
      </div>
    ))}
  </div>
)

export default compose(
  connect(
    (state: State) => ({
      limit: addNeighboursLimitSelector(state),
    }),
    {updateValue}
  ),
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
      const clickedEid = getNodeEid(nodes[0])

      if (props.entityDetails[clickedEid.toString()]) {
        const related = props.entityDetails[clickedEid.toString()].related
        props.updateValue(
          ['connections', 'subgraph', getSubgraphId(props), 'data'],
          addNeighbours(
            props.subgraph,
            clickedEid,
            pointer.canvas,
            related,
            props.limit || ADD_NEIGHBOURS_LIMIT
          )
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
        props.updateValue(
          ['connections', 'subgraph', getSubgraphId(props), 'data'],
          removeNodes(props.subgraph, nodes.map(getNodeEid), true)
        )
        props.updateValue(['connections', 'selectedEids'], [])
      }
    },
    handleDragEnd: () => resetGesture,
  })
)(Subgraph)
