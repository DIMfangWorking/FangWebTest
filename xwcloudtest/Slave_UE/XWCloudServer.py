__version__ = "0.1"
__all__ = ["XWCloudServer", "Resource"]
__author__ = "guowei"

import os, sys, platform, traceback
import posixpath
import BaseHTTPServer
from SocketServer import ThreadingMixIn
import SocketServer
import threading
import urllib
import cgi
import shutil
import mimetypes
import re
import time
import urlparse  
import socket
import struct

def unpack(value):
  """Return a three tuple of data, code, and headers"""
  if not isinstance(value, tuple):
    return value, 200, {}

  try:
    data, code, headers = value
    return data, code, headers
  except ValueError:
    pass

  try:
    data, code = value
    return data, code, {}
  except ValueError:
    pass

  return value, 200, {}

class HttpRequest(object):
  def __init__(self, headers, data = None):
    self.headers = headers;
    self.data = data;

  def json(self):
    import json;
    return json.loads(self.data);

  def __exit__(self, *argv):
    del self.headers
    del self.data

  def __enter__(self):
    return self;

class Resource(object):
  def __init__(self, req):
    self.request = req;
  def do_GET(self):
    return {"resutl" : -1, "message" : "no interface for implementation"};
  def do_POST(self):
    return {"resutl" : -1, "message" : "no interface for implementation"};
  def do_PUT(self):
    return {"resutl" : -1, "message" : "no interface for implementation"};
  def do_DELETE(self):
    return {"resutl" : -1, "message" : "no interface for implementation"};
  def do_HEAD(self):
    return {"resutl" : -1, "message" : "no interface for implementation"};

class SimpleHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
  server_version = "XwCloudTestHTTP/" + __version__

  def parse_request(self):
    result = False;
    try :
      result = super(SimpleHTTPRequestHandler, self).parse_request();
    except:
      result = BaseHTTPServer.BaseHTTPRequestHandler.parse_request(self);

    if result :
      self.command = self.command.upper();

    return result;

  def handle(self):
    self.error_message_format = "{\"result\" : -1, \"message\" : \"%(code)s = %(message)s. %(explain)s\"}";
    self.error_content_type = "application/json; charset=utf-8";
    try :
      super(SimpleHTTPRequestHandler, self).handle();
    except:
      BaseHTTPServer.BaseHTTPRequestHandler.handle(self);

  def handle_one_request(self):
    try :
      try :
        super(SimpleHTTPRequestHandler, self).handle_one_request();
      except:
        BaseHTTPServer.BaseHTTPRequestHandler.handle_one_request(self);
    except:
      traceback.print_exc(file=sys.stdout)
      self.send_error(505, str(sys.exc_info()[1]));

  def send_response(self, code, message=None):
    self.send_header("Content-type", "application/json; charset=utf-8")
    try :
      super(SimpleHTTPRequestHandler, self).send_response(code, message);
    except:
      BaseHTTPServer.BaseHTTPRequestHandler.send_response(self, code, message);

  def construction_request(self):
    data = None;
    parsed_path = urlparse.urlparse(self.path)  
    message_parts = {'client_address' : str(self.client_address),
        'method' : self.command,  
        'path' : self.path,  
        'real_path' : parsed_path.path,  
        'query' : parsed_path.query,  
        'param' : {},
        'request_version' : self.request_version,  
        'server_version' : self.server_version,  
        'sys_version' : self.sys_version,  
        'protocol_version' : self.protocol_version,  
        }
    for name, value in sorted(self.headers.items()):  
      message_parts[name] = value;

    p = urlparse.parse_qsl(message_parts['query']);
    for key in p:
      message_parts['param'][key[0]] = key[1]

    length, pdict = cgi.parse_header(self.headers.get('Content-Length', "0"))

    if int(length) > 0:
      data = self.rfile.read(int(length));

    return HttpRequest(message_parts, data);

  def request_process(self):
    req = self.construction_request();
    func = self.server.matchMethod(req.headers['real_path'], req.headers['method'], req);

    with req as request:
      message,code,header = unpack(func());

    message = str(message);
    self.send_response(code);
    self.send_header('Content-Length' , len(message));
    self.end_headers();
    self.wfile.write(message);

  def do_GET(self):
    """Serve a GET request."""
    self.request_process();

  def do_HEAD(self):
    """Serve a HEAD request."""
    self.send_header();
    self.end_headers();
 
  def do_POST(self):
    self.request_process();
 
  def do_PUT(self):
    self.request_process();

  def do_DELETE(self):
    """Serve a DELETE request."""
    parsed_path = urlparse.urlparse(self.path)  
    message_parts = [  
        'CLIENT VALUES:',  
        'client_address=%s' % str(self.client_address),  
        'command=%s' % self.command,  
        'path=%s' % self.path,  
        'real path=%s' % parsed_path.path,  
        'query=%s' % parsed_path.query,  
        'request_version=%s' % self.request_version,  
        '',  
        'SERVER VALUES:',  
        'server_version=%s' % self.server_version,  
        'sys_version=%s' % self.sys_version,  
        'protocol_version=%s' % self.protocol_version,  
        '',  
        'HEADERS RECEIVED:',  
        ]  
    for name, value in sorted(self.headers.items()):  
      message_parts.append('%s=%s' % (name, value.rstrip()))  
    message_parts.append('')
    message = '\r\n'.join(message_parts)

    self.send_response(200, message)

class XWCloudServer(ThreadingMixIn, BaseHTTPServer.HTTPServer):

  postMap = {};
  getMap = {};
  putMap = {};
  processMap = {};
  
  def __init__(self, addr):
    SocketServer.TCPServer.allow_reuse_address = True;
    BaseHTTPServer.HTTPServer.__init__(self, addr, SimpleHTTPRequestHandler);
    #ThreadingMixIn.__init__(self);

  def __PerformOption__(self, func, url, method):
    nname = func+'Map';
    if not hasattr(self, nname):
      raise Exception('not found attr ' + nname);

    if url == None or method == None:
      raise Exception('required url and method');
    attr = getattr(self, nname)

    attr[url] = method;

  def get_request(self):
    request,client = BaseHTTPServer.HTTPServer.get_request(self);
    request.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1);
    request.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack('ii', True,0));
    return request,client;

  def shutdown_request(self, request):
    request.shutdown(socket.SHUT_RDWR)
    BaseHTTPServer.HTTPServer.shutdown_request(self, request);

  def post(self, url, method):
    self.__PerformOption__('post', url, method);

  def get(self, url, method):
    self.__PerformOption__('get', url, method);

  def put(self, url, method):
    self.__PerformOption__('put', url, method);

  def process(self, url, proccessClass):
    self.__PerformOption__('process', url, proccessClass);

  def matchMethod(self, url, method, req):
    method = method.lower()
    try:
      pro = self.processMap[url](req);
      return getattr(pro, method);
    except:
      traceback.print_exc(file=sys.stdout)
      nname = method + 'Map';
      if not hasattr(self, nname):
        raise Exception('not found attr ' + nname);

      attr = getattr(self, nname)
      return attr[url];

if __name__ == '__main__':
  try:
    serveraddr = ('', 8080)
    server = XWCloudServer(serveraddr)
    server.process("/Atom", AtomOption);
    print "Serving HTTP on", serveraddr[0], "port", serveraddr[1], "..."
    server.serve_forever();
  except KeyboardInterrupt:
    print '^C received, shutting down server'
    server.socket.close()