import React, { Component } from 'react';
import * as serverAPI from '../actions/serverAPI';

import Graph from 'react-graph-vis';

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#000000"
  },
  interaction: {
    hover: true
  },
  physics:{
    enabled: true,
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.3,
      springLength: 95,
      springConstant: 0.004,
      damping: 0.09,
      avoidOverlap: 0
    },
  },
};

class Subgraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eids_A: props.eids_A,
      eids_B: props.eids_B,
      loading: true,
    };
    this.loadSubgraph = this.loadSubgraph.bind(this);
  }

  componentWillMount() {
    this.loadSubgraph(this.state.eids_A, this.state.eids_B);
  }

  handleNodeClick(event) {
    var { nodes, edges } = event;
    if (false) {
      console.log("Clicked nodes:");
      console.log(nodes);
      console.log("Clicked edges:");
      console.log(edges);
    }
    var eid_clicked = parseInt(nodes[0].toString(), 10);
    console.log("eID of clicked node: " + eid_clicked.toString());

    serverAPI.getRelated(eid_clicked, (neighbours) => {
      var nodes = this.state.graph.nodes.slice();
      var edges = this.state.graph.edges.slice(); 
      //neighbours.map(neighbour => {
      for (var i = 0; i < neighbours.length; i++) {
        var eid = neighbours[i].eid;
        var label = neighbours[i].name;
        console.log("Found related eID " + eid.toString());
        console.log(label);
        // TODO: Do we need to guard against re-adding an existing node and/or edge?
        // Yes, at least edges are duplicated (can see stronger spring behaviour)
        nodes.push({id: eid, label: label});
        edges.push({from: eid, to: eid_clicked});
        edges.push({from: eid_clicked, to: eid});
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
        var distAB = 4.0;

        // construct events
        var events = {
          select: function(event) {
            var { nodes, edges } = event;
            console.log("Selected nodes:");
            console.log(nodes);
            console.log("Selected edges:");
            console.log(edges);
          },
          click: this.handleNodeClick.bind(this),
        };

        // build graph
        var subgraph_nodes = subgraph['vertices'];
        var nodes = [];
        for (var i = 0; i < subgraph_nodes.length; i++) {
          var node = subgraph_nodes[i];
          var eid = node['eid'];
          //var label = subgraph_nodes[i]['entity_name'];
          var label = node['entity_name'];// + "( " + node['distance_from_A'] + ", " + node['distance_from_B'] + ")";
          var distA = node['distance_from_A'] == null ? 10.0 : node['distance_from_A'];
          var distB = node['distance_from_B'] == null ? 10.0 : node['distance_from_B'];
          if (distA > 0 && distA + distAB <= distB)
            continue;
          if (distB > 0 && distB + distAB <= distA)
            continue;
          if (distA + distB > distAB + 1.0)
            continue;
          var colorR = 255.0 - 200.0 * distA / distAB;
          var colorG = 255.0 - 200.0 * distB / distAB;
          var color = "rgba(" + colorR.toString() + ", " + colorG.toString() + ", 50, 1)";

          var vis_node = {id: eid, label: label, title: 'I have a popup!', color: color};
          if (distA === 0) {
            nodes.push({id: eid, label: label, title: label, color: color, x: 100, fixed: {x: true}});
            continue;
          }
          if (distB === 0) {
            nodes.push({id: eid, label: label, title: label, color: color, x: 800, fixed: {x: true}});
            continue
          }

          nodes.push(vis_node);
        }

        var edges = [];
        var subgraph_edges = subgraph['edges'];
        for (i = 0; i < subgraph_edges.length; i++) {
          var from = subgraph_edges[i][0];
          var to = subgraph_edges[i][1];
          edges.push({from: from, to: to});
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
          <Graph graph={this.state.graph} options={options} events={this.state.events} style={{ height: "400px" }} />
        )}
      </div>
    );
  }
}

export default Subgraph;
