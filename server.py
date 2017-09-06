#!/usr/bin/env python

import os
import mimetypes
import traceback
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

from generator import generate_multiple


class RequestHandler(BaseHTTPRequestHandler):

	def dynamic(self):
		if self.path.strip("/") == "generate":
			size = int(self.headers["Content-Length"])
			data = json.loads(self.rfile.read(size).decode("utf-8"))
			print(data)
			generate_multiple(data["config"], data["count"], "output/out%02d.jpg")
			return (200, "text/plain", b"200 OK")
		return None

	def static(self):
		path = "static/" + self.path

		if os.path.isdir(path):
			path += "/index.html"

		if os.path.isfile(path):
			ctype = mimetypes.guess_type(path)[0]
			if ctype is None:
				ctype = "text/plain"
			file = open(path, "rb")
			body = file.read()
			file.close()

			return (200, ctype, body)
			
		return (404, "text/plain", b"404 Not Found")

	def process(self):
		res = None

		try:
			res = self.dynamic()
			if res is None:
				res = self.static()
		except Exception as e:
			print("[error] RequestHandler.do_GET:")
			traceback.print_exc()
			res = (500, "text/plain", b"500 Internal Server Error")

		self.send_response(res[0])
		self.send_header("Content-type", res[1])
		self.send_header("Content-Length", len(res[2]))
		self.end_headers()

		self.wfile.write(res[2])

		self.wfile.flush()

	def do_POST(self):
		self.process();

	def do_GET(self):
		self.process();


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
	pass

httpd = ThreadedHTTPServer(("0.0.0.0", 8081), RequestHandler)
httpd.protocol_version = "HTTP/1.1"
print("[ ok ] server started")
httpd.serve_forever()
 