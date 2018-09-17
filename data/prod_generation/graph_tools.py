"""Functions for manipulating the graph of entities."""


def add_or_get_edge_type(db, edge_type_name, log_prefix=""):
  """Returns id of edge type with given name, creating if needed."""

  # Query edge types:
  edge_types = db.query("""
      SELECT stakeholder_type_id, stakeholder_type_text
      FROM stakeholdertypes;
      """)
  edge_type_name_to_index = {edge_type["stakeholder_type_text"]:
                             edge_type["stakeholder_type_id"]
                             for edge_type in edge_types}

  # Find or create edge type for presumed family members:
  if edge_type_name in edge_type_name_to_index:
    edge_type_index = edge_type_name_to_index[edge_type_name]
  else:
    edge_type_index = max(edge_type["stakeholder_type_id"]
                          for edge_type in edge_types) + 1
    db.execute("""
        INSERT INTO stakeholdertypes(
          stakeholder_type_id,
          stakeholder_type_text
        ) VALUES (%s, %s);""",
        [edge_type_index, edge_type_name]
    )

  print('%sEdge type name "%s" has index %d' % (
      log_prefix, edge_type_name, edge_type_index))
  return edge_type_index
