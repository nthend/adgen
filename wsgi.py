#!/usr/bin/env python

import os
import mimetypes
import traceback
import json

from generator import Generator


class App:
	def dynamic(self, environ):
		req = environ["PATH_INFO"].strip("/")
		opts = {}
		for pair in environ["QUERY_STRING"].split("&"):
			res = tuple(pair.split("="))
			if len(res) > 1:
				opts[res[0]] = res[1]

		if req == "generate":
			size = int(environ.get('CONTENT_LENGTH', 0))
			data = json.loads(environ['wsgi.input'].read(size).decode("utf-8"))
			print(data)
			gen = Generator(data["type"])
			gen.generate_multiple(data["config"], data["count"], "output/%06d.jpg")
			return ("200 OK", "text/plain", b"200 OK")
		elif req == "loadfile":
			path = "./" + opts["path"]
			ctype = mimetypes.guess_type(path)[0]
			file = open(path, "rb")
			body = file.read()
			file.close()
			return ("200 OK", ctype, body)
		return None

	def static(self, environ):
		path = "static/" + environ["PATH_INFO"]

		if os.path.isdir(path):
			path += "/index.html"

		if os.path.isfile(path):
			ctype = mimetypes.guess_type(path)[0]
			if ctype is None:
				ctype = "text/plain"
			file = open(path, "rb")
			body = file.read()
			file.close()

			return ("200 OK", ctype, body)
			
		return ("404 Not Found", "text/html", b"<h1>404 Not Found</h1>")

	def process(self, environ):
		res = None
		try:
			res = self.dynamic(environ)
			if res is None:
				res = self.static(environ)
		except Exception as e:
			print("[error] App.process:")
			traceback.print_exc()
			res = ("500 Internal Server Error", "text/html", b"<h1>500 Internal Server Error</h1>")
		return res


app = App()

def application(environ, start_response):
	res = app.process(environ)
	start_response(res[0], [("Content-type", res[1]), ("Content-Length", str(len(res[2])))])
	return [res[2]]


if __name__ == "__main__":
	from wsgiref.simple_server import make_server
	httpd = make_server("", 8081, application) 
	print("[ ok ] server started")
	httpd.serve_forever() 
