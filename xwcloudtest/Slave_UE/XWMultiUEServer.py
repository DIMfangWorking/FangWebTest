__version__ = "0.1"
__all__ = ["XWMultiUEServer", "Resource"]
__author__ = "guowei"

import struct;
import socket;

from SocketServer import DatagramRequestHandler;
from SocketServer import UDPServer;
from SocketServer import ThreadingMixIn;

class UDPRequest():
  def IMSIToNum(self, IMSI):
    # BCD code for IMSI
    h = '%x' %(IMSI);
    return int(h);

  def __init__(self, data, client, sock):    
    self.client = client;

    (msgtype,length,seqnum) = struct.unpack("!2HI", data[:8]);
    (imsi,) = struct.unpack("Q", data[8:16]);

    self.msgtype = msgtype;
    self.length = length;
    self.seqnum = seqnum;
    self.IMSI = self.IMSIToNum(imsi);
    self.socket = sock;

    self.data = data[16:];

  def getSeqNum(self):
    return self.seqnum;

  def __exit__(self, *argv):
    del self.data;
    del self.client;
    del self.socket;
    del self.seqnum;

  def __enter__(self):
    return self;

class Resource(object):
  def __init__(self, req):
    self.request = req;
  def do_1(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};
  def do_2(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};    	
  def do_3(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};
  def do_4(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};
  def do_5(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};
  def do_6(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};
  def do_7(self):
    return {'resutl' : -1, 'message' : 'no interface for implementation'};

class MyDatagramRequestHandler(DatagramRequestHandler):
    def finish(self):
        if self.wfile.getvalue():
            self.socket.sendto(self.wfile.getvalue(), self.client_address)

class SimpleUDPHandler(MyDatagramRequestHandler):
  """
  This class works similar to the TCP handler class, except that
  self.request consists of a pair of data and client socket, and since
  there is no connection the client address must be given explicitly
  when sending data back via sendto().
  """

  def handle(self):
    data = self.request[0];
    req = UDPRequest(data, self.client_address, self.socket);
    func = self.server.matchMethod(req.msgtype, req);
    with req as request:
      message = func();

    if message and len(message) > 0:
      self.wfile.write(message);

class XWMultiUEServer(ThreadingMixIn, UDPServer):
  proccessMap = [];

  def __init__(self, addr):
    UDPServer.__init__(self, addr, SimpleUDPHandler);
    #ThreadingMixIn.__init__(self);

  def process(self, proccessClass):
    self.proccessMap.append(proccessClass);

  def matchMethod(self, msgtype, req):
    nfunc = 'do_'+str(msgtype);
    for pro in self.proccessMap:
      if nfunc in dir(pro):
        func = getattr(pro(req), nfunc);
        if callable(func):
          return func;
        else:
          raise Exception('not callable '+str(func));
    raise Exception('not found msg ' + str(msgtype) + ' process function');

if __name__ == "__main__":
  HOST, PORT = "localhost", 9999
  server = SocketServer.UDPServer((HOST, PORT))
  server.serve_forever()
