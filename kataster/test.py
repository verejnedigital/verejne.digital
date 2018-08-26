"""Unit tests for backend application kataster.

Run all unit tests from command line as:
  python test.py
To run an individual unit test only, run (for example):
  python test.py TestHandlers.test_kataster_info_politician
"""
import json
import unittest
import webapp2

import server


def _request_json(url, test_handler):
  """ Utility method to check a JSON is returned from the given URL """
  request = webapp2.Request.blank(url)
  response = request.get_response(server.app)
  test_handler.assertEqual(response.status_int, 200)
  test_handler.assertEqual(response.content_type, 'application/json')
  j = json.loads(response.text)
  return j


class TestHandlers(unittest.TestCase):

  def test_kataster_info_location(self):
    content = _request_json('/kataster_info_location?lat=48.1451953&lon=17.0910016', self)
    self.assertTrue(content)

  def test_kataster_info_company(self):
    content = _request_json('/kataster_info_company?name="KOLIBA REAL a.s."', self)
    self.assertTrue(content)

  def test_kataster_info_person(self):
    content = _request_json('/kataster_info_person', self)

  def test_kataster_info_politician(self):
    content = _request_json('/kataster_info_politician?id=40', self)
    self.assertIsInstance(content, list)
    self.assertTrue(content)
    print('KatasterInfoPolitician returned %d results.' % (
        len(content)))

  def test_list_politicians(self):
    content = _request_json('/list_politicians', self)
    self.assertIsInstance(content, list)
    self.assertTrue(content)
    print('ListPoliticians returned %d results.' % (len(content)))

  def test_info_politician(self):
    content = _request_json('/info_politician?id=40', self)
    self.assertIsInstance(content, dict)
    self.assertTrue(content)

  def test_asset_declarations(self):
    content = _request_json('/asset_declarations?id=40', self)
    self.assertIsInstance(content, list)
    self.assertTrue(content)
    print('AssetDeclarations returned %d declarations.' % (
        len(content)))


def main():
  server.initialise_app()
  unittest.main()


if __name__ == '__main__':
  main()
