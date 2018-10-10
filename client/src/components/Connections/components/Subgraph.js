// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import GraphCompnent from 'react-graph-vis'
import {Col, Row, Input} from 'reactstrap'
import InfoLoader from './InfoLoader'
import {addNeighboursLimitSelector} from '../../../selectors'
import {updateValue} from '../../../actions/sharedActions'
import {setAddNeighboursLimit} from '../../../actions/connectionsActions'
import SubgraphWrapper from '../dataWrappers/SubgraphWrapper'
import {options as graphOptions, getNodeEid, addNeighbours, removeNodes} from './graph/utils'
import {checkShaking, resetGesture} from './graph/gestures'
import type {SubgraphProps} from '../dataWrappers/SubgraphWrapper'
import type {EntityProps} from '../dataWrappers/EntityWrapper'
import type {ConnectionProps} from '../dataWrappers/ConnectionWrapper'
import type {GraphId, Node, State} from '../../../state'
import type {Point} from './graph/utils'
import {ADD_NEIGHBOURS_LIMIT} from '../../../constants'

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
  limit: number,
  limitSettingsOpen: boolean,
  setLimitSettingsOpen: (open: boolean) => void,
} & EntityProps &
  ConnectionProps

type DispatchProps = {
  updateValue: Function,
  setAddNeighboursLimit: Function,
}
type Handlers = {
  handleSelect: (e: GraphEvent) => void,
  handleDoubleClick: (e: GraphEvent) => void,
  handleDrag: (e: GraphEvent) => void,
  handleDragEnd: (e: GraphEvent) => void,
  handleLimitChange: (e: Event) => void,
  openLimitSettings: (e: Event) => void,
  closeLimitSettings: (e: Event) => void,
  submitOnEnter: (e: KeyboardEvent) => void,
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
  const step = 120
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
        label: 'Kontakt\ns politikou',
        group: 'politTies',
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
        label: 'Politik',
        group: 'politician',
        fixed: true,
        physics: false,
      },
      {
        id: '6',
        x: x + 5 * step,
        y,
        label: 'Údaje sa\nnačítavajú',
        group: 'notLoaded',
        fixed: true,
        physics: false,
      },
      {
        id: '7',
        x: x + 6 * step,
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
  limit,
  handleLimitChange,
  limitSettingsOpen,
  openLimitSettings,
  closeLimitSettings,
  submitOnEnter,
}: Props) => (
  <div className="subgraph">
    <Row>
      <Col lg="5" md="12">
        Ovládanie:
        <ul>
          <li>Ťahanie vrchola: premiestnenie vrchola v grafe</li>
          <li>
            Klik na vrchol: načítať a zobraziť detailné informácie o vrchole (v boxe pod grafom)
          </li>
          <li>Dvojklik na vrchol: pridať do grafu {limitSettingsOpen
            ? <Input
              className="limit-input"
              value={limit || ''}
              onChange={handleLimitChange}
              onBlur={closeLimitSettings}
              onKeyPress={submitOnEnter}
              autoFocus
            />
            : <b className="limit" onClick={openLimitSettings}>{limit}</b>
          } nezobrazených susedov</li>
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
        }}
        style={graphStyle}
      />
    </div>
    {selectedEids.map((eid) => <InfoLoader key={eid} eid={eid} />)}
  </div>
)

export default compose(
  connect(
    (state: State) => ({
      limit: addNeighboursLimitSelector(state),
    }),
    {updateValue, setAddNeighboursLimit}
  ),
  withState('limitSettingsOpen', 'setLimitSettingsOpen', false),
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
      const subgraphId =
        props.entity2.query.length > 0
          ? `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
          : `${props.entity1.eids.join()}`
      const clickedEid = getNodeEid(nodes[0])

      if (props.entityDetails[clickedEid.toString()]) {
        const related = props.entityDetails[clickedEid.toString()].related
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
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
        const subgraphId =
          props.entity2.query.length > 0
            ? `${props.entity1.eids.join()}-${props.entity2.eids.join()}`
            : `${props.entity1.eids.join()}`
        props.updateValue(
          ['connections', 'subgraph', subgraphId, 'data'],
          removeNodes(props.subgraph, nodes.map(getNodeEid), true)
        )
        props.updateValue(['connections', 'selectedEids'], [])
      }
    },
    handleDragEnd: () => resetGesture,
    handleLimitChange: (props: OwnProps & DispatchProps & SubgraphProps) => (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        const {value} = e.target
        const limit = Number(value)
        if (value === '' || (Number.isInteger(limit) && limit >= 0)) {
          props.setAddNeighboursLimit(value === '' ? null : limit)
        }
      }
    },
    openLimitSettings: (props: OwnProps & DispatchProps & SubgraphProps) => () =>
      props.setLimitSettingsOpen(true),
    closeLimitSettings: (props: OwnProps & DispatchProps & SubgraphProps) => () => {
      props.limit || props.setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
      props.setLimitSettingsOpen(false)
    },
    submitOnEnter: (props: OwnProps & DispatchProps & SubgraphProps) => (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        props.limit || props.setAddNeighboursLimit(ADD_NEIGHBOURS_LIMIT)
        props.setLimitSettingsOpen(false)
      }
    },
  })
)(Subgraph)
