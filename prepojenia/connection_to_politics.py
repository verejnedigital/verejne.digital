"""Finds connections between recent contract winners and politics.

This is a standalone script that generates a report in *.txt format.
Example run:
  python connection_to_politics.py
"""

import argparse
import os
import sys
import tqdm

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection


def report_on(contract, relations, political_eids, max_distance, db, file_output):
    """Writes report on specified `supplier_eid`."""

    supplier_eid = contract["supplier_eid"]

    neighbourhood = relations._neighbourhood_bfs([supplier_eid], max_distance)

    # Sort by distance
    politician_by_distance = sorted(
        (neighbourhood[eid], eid) for eid in political_eids
        if eid in neighbourhood)
    if politician_by_distance:
        report = "Contract(%d) signed on %s:\n" % (
            contract["contract_id"], contract["signed_on"])
        report += "\tSupplier: %s (eid %d)\n" % (
            contract["supplier_name"], supplier_eid)
        report += "\tPrice: %.2f (total: %.2f)\n" % (
            contract["contract_price_amount"],
            contract["contract_price_total_amount"])

        for distance, eid in politician_by_distance:
            # Retrieve the name of the entity:
            rows = db.query("SELECT name FROM entities WHERE id=%s;", [eid])
            assert len(rows) == 1
            name = rows[0]["name"]

            report += "\tDistance %d: %s (eid %d)\n" % (distance, name, eid)

        # print(report)
        file_output.write(report.encode("utf-8"))


def reveal_connection_to_politics(max_relations_to_load,
                                  num_contracts, max_distance,
                                  path_output):
    """Reveals connections between recent contract winners and politics.

    Args:
      max_relations_to_load: Maximum number of relations to load from
          production table `related`. Use a smaller number for faster
          debugging only.
      num_contracts: Number of most recent contracts to analyse.
      max_distance: Maximum distance at which connections are reported.
      path_output: Path where to write the resulting report.
    """

    # Connect to the database:
    db = DatabaseConnection(path_config=os.path.abspath(os.path.join(os.path.dirname(__file__), 'db_config.yaml')))
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ';')

    # Load relations and notable eIDs:
    relations = server._initialise_relations(db, max_relations_to_load)
    notable_eids = server._initialise_notable_eids(db)

    # Retrieve most recent contracts with positive price:
    q = """
      SELECT
        supplier_eid,
        entities.name AS supplier_name,
        contract_price_amount,
        contract_price_total_amount,
        signed_on,
        effective_from,
        effective_to,
        status_id,
        contract_id
      FROM
        contracts
      INNER JOIN
        entities ON entities.id=contracts.supplier_eid
      WHERE
        signed_on IS NOT NULL
        AND signed_on <= now()
        AND (
          contract_price_amount > 0 OR contract_price_total_amount > 0
        )
        AND entities.name LIKE '%%.'
        AND entities.name NOT LIKE '%%lovensk%%'
      ORDER BY
        signed_on DESC
      LIMIT %s;
  """
    with open(path_output, "w") as file_output:
        rows = db.query(q, [num_contracts])
        for row in tqdm.tqdm(rows):
            report_on(row, relations, notable_eids, max_distance, db,
                      file_output)

    db.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--max_relations_to_load",
        type=int,
        default=123456789,
        help="Use a smaller number only for faster debugging.")
    parser.add_argument(
        "--num_contracts",
        type=int,
        default=2000,
        help="Number of most recent contracts to analyse.")
    parser.add_argument(
        "--max_distance",
        type=int,
        default=2,
        help="Maximum distance at which connections are reported.")
    parser.add_argument(
        "--path_output",
        default="/tmp/connection_to_politics.txt",
        help="Path to output file.")
    args = parser.parse_args()

    reveal_connection_to_politics(
        args.max_relations_to_load,
        args.num_contracts,
        args.max_distance,
        args.path_output
    )


if __name__ == "__main__":
    main()
