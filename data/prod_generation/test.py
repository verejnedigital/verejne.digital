#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Unit tests for prod data generation.

Run all unit tests from command line as:
  python test.py
To run an individual unit test only, run (for example):
  python test.py TestHandlers.test_surname_similarity
"""

import unittest

import entity_tools
import post_process_neighbours


class TestHandlers(unittest.TestCase):


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


def main():
  unittest.main()


if __name__ == '__main__':
  main()
