"""Defines the class Relations, representing a graph of entities."""

import collections
import heapq
import Queue
import random
import six


class Relations:
  """Represents a collection of relations between Entities.

  The collection of relations is represented as a directed graph with
  multiple edge types. Entities correspond to vertices of the graph,
  and there is one directed edge set for each relationship type
  between Entities.
  """

  def __init__(self, edge_list):
    """Constructs a Relations object.

    Args:
      edge_list: List of tuples (u, v, t) representing directed edges
          from u to v of edge type t.
    """

    # Sort the edges lexicographically and for each source node store
    # a pointer into the list where its neighbours start.
    self.edges = edge_list
    self.edges.sort()
    self.start_index = {}
    for i in range(len(edge_list) - 1, -1, -1):
      source = self.edges[i][0]
      self.start_index[source] = i

  def bfs(self, start, end):
    # If start and end share entities, return the intersection
    common = list(set(start).intersection(set(end)))
    if (len(common)>0): return [common[0]]

    # Randomly swap start and end, so in case they are in different
    # components, in half of the cases, the BFS is done in the smaller one.
    swapped = bool(random.getrandbits(1))
    if swapped: start, end = end, start

    q = Queue.Queue()
    pred = {}
    for s in start:
      pred[s] = -1
      q.put(s)

    found = -1
    while (not q.empty()) and (found == -1):
      head = q.get()
      if not (head in self.start_index): continue
      from_index = self.start_index[head]
      for edge_index in xrange(from_index, len(self.edges)):
        edge = self.edges[edge_index]
        if (edge[0] != head): break
        to = edge[1]
        if to in pred: continue
        pred[to] = head
        if to in end:
          found = to
          break
        q.put(to)

    if found==-1: return []
    path = []
    cur = found
    while cur != -1:
      path.append(cur)
      cur = pred[cur]
    if not swapped: path.reverse()
    return path

  # Start exploring from list start. Never explore beyond distance cap.
  # If return_all is True, return distances of all explored vertices from the start set
  # If return_all is False, return the shortest path to a vertex in the list end
  def dijkstra(self, start, end, cap=999999999, return_all=False):
    # If start and end share entities, return the intersection
    common = list(set(start).intersection(set(end)))
    if (len(common)>0): return [common[0]]

    pred = {}
    distances = {}
    h = []

    def add(vertex, d, p):
      # already in the heap with smaller distance; ignore the edge
      if (distances.get(vertex, 999999999) <= d): return
      if (d > cap): return
      pred[vertex] = p
      distances[vertex] = d
      heapq.heappush(h, (d, vertex))

    # add start vertices
    for i in start: add(i, 0, -1)

    found = -1
    while len(h) > 0:
      entry = heapq.heappop(h)
      vertex = entry[1]
      if vertex in end:
        found = vertex
        break
      if not (vertex in self.start_index): continue
      distance = entry[0]
      # Vertex processed at smaller distance; ignore
      if (distance > distances.get(vertex, 999999999)): continue
      from_index = self.start_index[vertex]
      for edge_index in xrange(from_index, len(self.edges)):
        edge = self.edges[edge_index]
        # If outside of edges from the 'vertex'; stop
        if (edge[0] != vertex): break
        add(edge[1], distance + edge[2], vertex)

    if return_all: return distances

    if found == -1: return []
    path = []
    cur = found
    while cur != -1:
      path.append(cur)
      cur = pred[cur]
    path.reverse()
    return path

  def _outgoing_edges(self, vertex):
    """Returns an iterator over edges leaving from `vertex`."""

    if vertex not in self.start_index:
      return
    from_index = self.start_index[vertex]
    for edge_index in xrange(from_index, len(self.edges)):
      edge = self.edges[edge_index]
      # If outside of edges from the 'vertex'; stop
      if (edge[0] != vertex):
        return
      yield edge

  def _neighbourhood_bfs(self, start, radius):
    """Returns all vertices within `radius` steps from `start`."""

    queue = collections.deque((vertex, 0) for vertex in set(start))
    neighbourhood = {vertex: 0 for vertex in start}
    while len(queue) >= 1:
      vertex, distance = queue.pop()
      for _, target, _ in self._outgoing_edges(vertex):
        if (target not in neighbourhood) and (distance + 1 <= radius):
          neighbourhood[target] = distance + 1
          queue.appendleft((target, distance + 1))
    return neighbourhood

  def _get_spanning_subgraph(self, vertices_eids):
    """Returns dict describing subgraph spanned by `vertices_eids`."""

    vertices = [{'eid': eid} for eid in vertices_eids]
    edges = [(vertex, target, edge_type)
             for vertex in vertices_eids
             for _, target, edge_type in self._outgoing_edges(vertex)
             if target in vertices_eids]
    return {'vertices': vertices, 'edges': edges}

  def get_notable_connections_subgraph(
      self, start, notable_eids, max_distance,
      max_nodes_to_explore, max_order):
    """Returns a subgraph that is a neighbourhood of `start`.

    Args:
      start: Iterable of eIDs specifying the entities of interest
          around which to search. Usually this will be a collection of
          eIDs returned by a search for a name.
      notable_eids: Set of eIDs representing "notable" entities.
          Usually these will be political entities (known politicians
          and political parties).
      max_distance: Maximum distance form `start` to explore.
      max_nodes_to_explore: Maximum number of distinct nodes the BFS
          will encounter before terminating. Tweak this parameter to
          get sufficiently fast responses from the APIs.
      max_order: Maximum number of vertices to return.
    Returns:
      Subgraph containing all nodes in `start` and all shortest paths
      between `start` and `notable_eids` that are within
      `max_distance` from `start`, up to the constraints imposed by
      the `max_nodes_to_explore` and `max_order` parameters.
    """

    # Initialise search:
    distance = {eid: 0 for eid in start}
    queue = [eid for eid in set(start)]

    # Iterate through the queue in FIFO order:
    queue_index = 0
    while (queue_index < len(queue)) and (
        len(queue) < max_nodes_to_explore):
      vertex = queue[queue_index]
      vertex_distance = distance[vertex]
      if vertex_distance >= max_distance:
        break

      # Iterate through unseen neighbours of `vertex`:
      for _, target, _ in self._outgoing_edges(vertex):
        if target not in distance:
          distance[target] = vertex_distance + 1
          queue.append(target)
          if len(queue) == max_nodes_to_explore:
            break

      queue_index += 1

    # For each vertex v, compute the smallest integer d such that v
    # lies on a shortest path between `start` and a notable entity
    # that is distance d away from `start`.
    vertex_d = {}
    for i in range(len(queue) - 1, -1, -1):
      vertex = queue[i]
      vertex_distance = distance[vertex]

      # If notable itself, cannot be on a shortest path to another
      # notable entity that would be closer to `start` (BFS ordering).
      if vertex in notable_eids:
        vertex_d[vertex] = vertex_distance
        continue

      # Look at neighbours that are one step further away from `start`
      # then `vertex`, i.e. a shortest path flows through `vertex`.
      d = float('inf')
      for _, target, _ in self._outgoing_edges(vertex):
        if (target in vertex_d) and (distance[target] == vertex_distance + 1):
          d = min(d, vertex_d[target])
      if d <= max_distance:
        vertex_d[vertex] = d

    # Group entities according to their values of d:
    entities_with_d = [[] for _ in six.moves.range(max_distance + 1)]
    for vertex in queue:
      if vertex in vertex_d:
        entities_with_d[vertex_d[vertex]].append(vertex)

    # Determine vertices to be included in the subgraph by finding
    # a limit on `d` such that `max_order` is not exceeded.
    subgraph_vertices = []
    d = 0
    while (d <= max_distance) and (
        len(subgraph_vertices) + len(entities_with_d[d]) <= max_order):
      subgraph_vertices.extend(entities_with_d[d])
      d += 1

    # If no notable connections have been found at all, include the
    # immediate neighbourhood of `start`.
    if not subgraph_vertices:
      for vertex in queue:
        subgraph_vertices.append(vertex)
        if distance[vertex] >= 2 or len(subgraph_vertices) >= max_order:
          break

    # Construct and return the subgraph:
    subgraph = self._get_spanning_subgraph(subgraph_vertices)
    for vertex in subgraph['vertices']:
      vertex['distance'] = distance[vertex['eid']]
      vertex['notable'] = vertex['eid'] in notable_eids
    return subgraph

  def subgraph(self, set_A, set_B, max_distance, tolerance):
    """Returns a subgraph containing connections between A and B.

    Args:
      set_A: List of eids specifying the first set of vertices.
      set_B: List of eids specifying the second set of vertices.
      max_distance: Maximum length of A-B connections to consider.
      tolerance: Integer specifying how much longer a path can be
          than a shortest path for it to be considered.
    Returns:
      Subgraph spanned by all vertices that lie on a path between A
      and B that is at most `tolerance` longer than a shortest path
      between A and B. An empty subgraph is returned if no shortest
      path of length at most `max_distance` exists.
    """
    # TODO: Implement a faster algorithm.

    # Explore neighbourhoods of the set A and the set B:
    print("Starting neighbourhood searches...")
    dists_A = self._neighbourhood_bfs(set_A, max_distance + tolerance)
    dists_B = self._neighbourhood_bfs(set_B, max_distance + tolerance)
    dists_AB = [dists_A[v] for v in set_B if v in dists_A]

    # Return empty subgraph if no connection of length `max_distance`:
    if len(dists_AB) == 0:
      return {'vertices': [], 'edges': []}
    dist_AB = min(dists_AB)
    if dist_AB > max_distance:
      return {'vertices': [], 'edges': []}

    # Determine subgraph's vertices (eIDs):
    vertices_eids = set()
    vertices_eids.update(set_A)
    vertices_eids.update(set_B)
    for v in dists_A:
      if (v in dists_B) and (dists_A[v] + dists_B[v] <= dist_AB + tolerance):
        vertices_eids.add(v)

    # Build and return the spanning subgraph:
    subgraph = self._get_spanning_subgraph(vertices_eids)
    for vertex in subgraph['vertices']:
      vertex['distance_from_A'] = dists_A.get(vertex['eid'], None)
      vertex['distance_from_B'] = dists_B.get(vertex['eid'], None)
    return subgraph
