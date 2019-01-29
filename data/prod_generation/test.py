#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Unit tests for prod data generation.

Run all unit tests from command line as:
  cd verejne.digital/data
  python -m prod_generation.test
To run an individual unit test only, run (for example):
  python -m prod_generation.test TestHandlers.test_surname_similarity
"""

import unittest

import db.db as db_lib
import prod_generation.entity_tools as entity_tools
import prod_generation.post_process_neighbours as post_process_neighbours
import prod_generation.post_process_income_graph as post_process_income_graph


class EntityResolutionTestHandlers(unittest.TestCase):


  def setUp(self):
    """Loads surnames and academic titles."""
    self.surnames = entity_tools.get_surnames()
    self.titles_parser = entity_tools.get_academic_titles_parser()


  def test_parse_entity_name(self):
    """Tests `entity_tools.parse_entity_name`."""

    test_cases = [
        ("CVTI SR", None),
        ("Ministerstvo vnútra SR", None),
    ]
    for name, desired_parse in test_cases:
      parse = entity_tools.parse_entity_name(
          name, self.titles_parser, self.surnames, verbose=False)
      self.assertTrue(parse == desired_parse)


  def test_surname_similarity(self):
    """Tests `post_process_neighbours._are_surnames_similar`."""

    test_cases = [
        ("CVTI SR", "Ministerstvo vnútra SR", False),
    ]
    for name1, name2, desired_response in test_cases:
      parse1 = entity_tools.parse_entity_name(
          name1, self.titles_parser, self.surnames, verbose=False)
      parse2 = entity_tools.parse_entity_name(
          name2, self.titles_parser, self.surnames, verbose=False)
      if (not parse1) or (not parse2):
        response = False
      else:
        response = post_process_neighbours._are_surnames_similar(
            parse1.surname, parse2.surname)
      self.assertTrue(response == desired_response)


class PostProcessingTestHandlers(unittest.TestCase):


  def setUp(self):
    db = db_lib.DatabaseConnection(
        path_config='db_config_update_source.yaml')
    schema = db.get_latest_schema('prod_')
    schema_profil = db.get_latest_schema('source_internal_profil_')
    db.execute(
        'SET search_path="' + schema + '", "' + schema_profil + '";')
    self.db = db


  def tearDown(self):
    self.db.conn.rollback()
    self.db.close()


  def test_post_processing_income_graphs(self):
    post_process_income_graph.add_income_graphs(self.db)


def main():
  unittest.main()


if __name__ == '__main__':
  main()
