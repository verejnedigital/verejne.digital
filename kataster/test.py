"""Unit tests for backend application kataster.

Run all unit tests from command line as:
  python test.py
To run an individual unit test only, run (for example):
  python test.py TestHandlers.test_kataster_info_politician
"""
import json
import tqdm
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

    def test_kataster_info_location(self): # TODO this does not work - did it work sometime?
        content = _request_json('/kataster_info_location?lat=48.1451953&lon=17.0910016', self)
        self.assertTrue(content)
        print('test_kataster_info_location', content)

    def test_kataster_info_company(self): # TODO this does not work - did it work sometime?
        content = _request_json('/kataster_info_company?name="KOLIBA REAL a.s."', self)
        self.assertTrue(content)
        print('test_kataster_info_company', content)

    def test_kataster_info_person(self): # TODO this does not work - NOT IMPLEMENTED
        content = _request_json('/kataster_info_person', self)
        # self.assertTrue(content)
        # print('test_kataster_info_person', content)

    def test_kataster_info_politician(self):
        politician_id = 653
        content = _request_json('/kataster_info_politician?id=%d' % politician_id, self)
        self.assertIsInstance(content, list)
        print('KatasterInfoPolitician returned %d results:' % len(content))
        for entry in content:
            print('%s in %s, LV %d, parcel(s) %s' % (
                entry['landusename'], entry['cadastralunitname'],
                entry['foliono'], entry['parcelno']))

    def test_list_politicians(self):
        groups = [
            'all', 'active', 'nrsr_mps',
            'candidates_2018_bratislava_mayor',
            'candidates_2019_president'
        ]
        for group in groups:
            content = _request_json('/list_politicians?group=%s' % group, self)
            self.assertIsInstance(content, list)
            self.assertTrue(content)
            print('ListPoliticians(%s) returned %d results.' % (group, len(content)))
            if group == 'candidates_2019_president':
                for row in content:
                    print('%s %s %s %s %s %s %s %s' % (
                        row["id"], row["surname"], row["firstname"],
                        row["office_name_male"], row["term_finish"],
                        row["num_houses_flats"], row["num_fields_gardens"],
                        row["num_others"]))

    def test_info_politician(self):
        politician_id = 2992
        content = _request_json('/info_politician?id=%d' % politician_id, self)
        self.assertIsInstance(content, dict)
        self.assertTrue(content)
        print('InfoPolitician(%d) responded:' % politician_id)
        print(json.dumps(content, indent=2, ensure_ascii=False))

    def test_asset_declarations(self):
        politician_id = 717
        content = _request_json('/asset_declarations?id=%d' % politician_id, self)
        self.assertIsInstance(content, list)
        print('AssetDeclarations returned %d declarations.' % len(content))

    def test_all_politicians(self):
        """Tests API calls for everyone returned by list_politicians."""

        # Query list_politicians API to obtain list of politician_id's.
        politicians = _request_json('/list_politicians?group=all', self)
        for politician in tqdm.tqdm(politicians):
            politician_id = politician["id"]

            # Test info_politician.
            content = _request_json(
                '/info_politician?id=%d' % politician_id, self)
            self.assertIsInstance(content, dict)
            self.assertTrue(content)

            # Test asset_declarations.
            content = _request_json(
                '/asset_declarations?id=%d' % politician_id, self)
            self.assertIsInstance(content, list)

            # Test kataster_info_politician.
            content = _request_json(
                '/kataster_info_politician?id=%d' % politician_id, self)
            self.assertIsInstance(content, list)


def main():
    server.initialise_app()
    unittest.main()


if __name__ == '__main__':
    main()
