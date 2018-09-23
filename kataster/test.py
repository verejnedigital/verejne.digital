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
    content = _request_json('/kataster_info_politician?id=295', self)
    self.assertIsInstance(content, list)
    print('KatasterInfoPolitician returned %d results.' % (
        len(content)))

  def test_list_politicians(self):
    groups = [
        'active', 'nrsr_mps', 'candidates_2018_bratislava_mayor',
        'candidates_2019_president'
    ]
    for group in groups:
      content = _request_json(
          '/list_politicians?group=%s' % (group), self)
      self.assertIsInstance(content, list)
      self.assertTrue(content)
      print('ListPoliticians(%s) returned %d results.' % (
          group, len(content)))
      #for row in content:
      #  print(row["id"], row["surname"], row["firstname"],
      #        row["office_name_male"], row["term_finish"])

  def test_info_politician(self):
    politician_id = 965
    content = _request_json(
      '/info_politician?id=%d' % (politician_id), self)
    self.assertIsInstance(content, dict)
    self.assertTrue(content)
    print('InfoPolitician(%d) responded:' % (politician_id))
    for key in content:
      print("%s: %s" % (key, content[key]))

  def test_asset_declarations(self):
    content = _request_json('/asset_declarations?id=717', self)
    self.assertIsInstance(content, list)
    print('AssetDeclarations returned %d declarations.' % (
        len(content)))


def main():
  server.initialise_app()
  unittest.main()


if __name__ == '__main__':
  main()
