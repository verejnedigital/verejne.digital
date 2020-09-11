"""Runs the server for backend application `data`."""

import argparse
import json
from paste import httpserver
import webapp2

import status


class MyServer(webapp2.RequestHandler):
    """Abstract request handler, to be subclasses by server hooks."""

    def get(self):
        """Implements actual hook logic and responds to requests."""
        raise NotImplementedError('Must implement method `get`.')

    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))


class SourceDataInfo(MyServer):
    def get(self):
        result = status.get_source_data_info()
        self.returnJSON(result)


class ProdDataInfo(MyServer):
    def get(self):
        result = status.get_prod_data_info()
        self.returnJSON(result)


class PublicDumpsInfo(MyServer):
    def get(self):
        result = status.get_public_dumps_info()
        self.returnJSON(result)


class ColabsInfo(MyServer):
    def get(self):
        result = status.get_colabs_info()
        self.returnJSON(result)


# Setup the webapp2 WSGI application.
app = webapp2.WSGIApplication([
    ('/source_data_info', SourceDataInfo),
    ('/prod_data_info', ProdDataInfo),
    ('/public_dumps_info', PublicDumpsInfo),
    ('/colabs_info', ColabsInfo),
], debug=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--listen',
                      help='host:port to listen on',
                      default='127.0.0.1:8084')
    args = parser.parse_args()

    host, port = args.listen.split(':')
    httpserver.serve(
      app,
      host=host,
      port=port,
      request_queue_size=128,
      use_threadpool=True,
      threadpool_workers=32,
    )


if __name__ == '__main__':
    main()
