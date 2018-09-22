import React, { Component } from 'react';
import InfoLoader from './info/InfoLoader';
import * as serverAPI from '../actions/serverAPI';

import Graph from 'react-graph-vis';

import './Subgraph.css';

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    arrows: {to: {enabled: false}},
    color: "#000000",
    hoverWidth: 0,
  },
  groups: {
    source: {
      color: {background: "#337ab7", border: "#245580", highlight: {background: "#337ab7", border: "#245580"}},
      font: {color: '#ffffff'}
    },
    target: {
      color: {background: "#337ab7", border: "#245580", highlight: {background: "#337ab7", border: "#245580"}},
      font: {color: '#ffffff'}
    },
  },
  interaction: {
    hover: false,
    multiselect: true,
  },
  nodes: {
    color: {
      background: "white",
      border: "#cddae3",
      highlight: {background: "#f2f5f8", border: "#cddae3"}
    },
    font: {size: 15, color: "#0062db"},
    labelHighlightBold: false,
    shape: "box",
    shapeProperties: {borderRadius: 4},
  },
  physics:{
    enabled: true,
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.3,
      springLength: 90,
      springConstant: 0.004,
      damping: 0.09,
      avoidOverlap: 0.001
    },
  },
};
const style = {
  width: "100%",
  height: "600px",
};

// add (undirected) edge a<->b to edges if not yet present
function add_edge_if_missing(a, b, edges) {
  for (var i = 0; i < edges.length; i++)
    if ((edges.from === a && edges.to === b) || (edges.from === b && edges.to === a))
      return;
  edges.push({from: a, to: b});
};

// hack: extract eID (id) of a given node via converting it to a string
function get_node_eID(node) {
  return parseInt(node.toString(), 10)
};

class Subgraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eids_A: props.eids_A,
      eids_B: props.eids_B,
      loading: true,
      eIDs_detail: [],
    };
    this.loadSubgraph = this.loadSubgraph.bind(this);
  }

  componentWillMount() {
    this.loadSubgraph(this.state.eids_A, this.state.eids_B);
  }

  handleSelect(event) {
    var { nodes, edges } = event;
    var eIDs_selected = nodes.map(get_node_eID);
    this.setState({eIDs_detail: eIDs_selected});
  }

  handleNodeDoubleClick(event) {
    // Query the API for neighbours of the double-clicked node
    var eid_clicked = get_node_eID(event.nodes);
    serverAPI.getRelated(eid_clicked, (neighbours) => {
      // Update graph with new neighbours
      var nodes = this.state.graph.nodes.slice();
      var edges = this.state.graph.edges.slice();
      for (var i = 0; i < neighbours.length; i++) {
        var eid = neighbours[i].eid;
        nodes.push({id: eid, label: neighbours[i].name});
        add_edge_if_missing(eid, eid_clicked, edges);
      }
      var graph = {nodes: nodes, edges: edges};
      this.setState({graph: graph});
    });
  }

  loadSubgraph() {
    serverAPI.subgraph(
      this.state.eids_A.map(eid => eid.eid).join(),
      this.state.eids_B.map(eid => eid.eid).join(),
      (subgraph) => {
        // construct events
        var events = {
          select: this.handleSelect.bind(this),
          doubleClick: this.handleNodeDoubleClick.bind(this),
        };

        // build graph
        var subgraph_nodes = subgraph['vertices'];
        var nodes = [];
        for (var i = 0; i < subgraph_nodes.length; i++) {
          var eid = subgraph_nodes[i]['eid'];
          var label = subgraph_nodes[i]['entity_name'];
          nodes.push({id: eid, label: label});
        }

        var edges = [];
        var subgraph_edges = subgraph['edges'];
        for (i = 0; i < subgraph_edges.length; i++) {
          var from = subgraph_edges[i][0];
          var to = subgraph_edges[i][1];
          add_edge_if_missing(from, to, edges);
        }

        this.setState({
          graph: {nodes: nodes, edges: edges},
          events: events,
          loading: false,
        }, this.loadConnections);
      });
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          'Prebieha načítavanie grafu ...'
        ) : (
          <div>
            Ovládanie:
            <ul>
              <li>Ťahanie vrchola: premiestnenie vrchola v grafe</li>
              <li>Klik na vrchol: zobraziť detailné informácie o vrchole (v boxe pod grafom)</li>
              <li>Dvojklik na vrchol: pridať do grafu chýbajúcich susedov</li>
            </ul>
            <div className="graph">
              <Graph graph={this.state.graph} options={options} events={this.state.events} style={style} className="graph" />
            </div>
            {this.state.eIDs_detail.map(eID => <InfoLoader key={eID} eid={eID} />)}
          </div>
        )}
      </div>
    );
  }
}

export default Subgraph;
