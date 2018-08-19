import collections
import heapq
import Queue
import random


class Relations:
  """Represents a collection of relations between Entities."""

  def __init__(self, edge_list):
    """Constructs a Relations object.

    Args:
      edge_list: Python list of tuples (u, v, l) representing directed
                 edges form u to v of length l.
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
    """Returns an iterator over edges leaving from vertex."""
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
    """Returns all vertices within radius steps from start."""
    queue = collections.deque((vertex, 0) for vertex in set(start))
    neighbourhood = {vertex: 0 for vertex in start}
    while len(queue) >= 1:
      vertex, distance = queue.pop()
      for _, target, _ in self._outgoing_edges(vertex):
        if (target not in neighbourhood) and (distance + 1 <= radius):
          neighbourhood[target] = distance + 1
          queue.appendleft((target, distance + 1))
    return neighbourhood

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

    # Determine subgraph's vertices (eIDs)
    vertices_eids = set()
    vertices_eids.update(set_A)
    vertices_eids.update(set_B)
    for v in dists_A:
      if (v in dists_B) and (dists_A[v] + dists_B[v] <= dist_AB + tolerance):
        vertices_eids.add(v)

    # Build vertices dictionary:
    vertices = []
    for eid in vertices_eids:
      vertices.append({
          'eid': eid,
          'distance_from_A': dists_A.get(eid, None),
          'distance_from_B': dists_B.get(eid, None),
      })

    # Build subgraph's edges
    edges = []
    for v1, v2, length in self.edges:
      if (v1 in vertices_eids) and (v2 in vertices_eids):
        edges.append((v1, v2, length))

    return {'vertices': vertices, 'edges': edges}
