__all__ = ['InformationCollection', 'InfomationCollectionHandler', 'Report', 'unpack'];
import sys;
import time;
import traceback;
import threading;

import xmltodict;

import ctypes;
import socket;
import struct;
import select;
from SocketServer import *;

from logger import getLogger;
logger = getLogger();

def unpack(value):
  if not isinstance(value, tuple):
    return value, None

  try:
    data, code = value
    return data, code
  except ValueError:
    pass

  return value, None

def _eintr_retry(func, *args):
  while True:
    try:
      return func(*args)
    except (OSError, select.error) as e:
      if e.args[0] != errno.EINTR:
        raise e

class Report(object):
  def __init__(self, report, server, sock, getReport):
    self.server = server;

    (msg, length, seq) = struct.unpack("!HHI", report[0:8]);

    self.msgtype = msg;
    self.seqnum = seq;
    self.length = length;
    self.socket = sock;
    self.report = report;

    self.data = getReport(self);
    if length != len(self.data):
      raise Exception('getReport length(' + str(len(self.data)) + ') not equal to msg head length(' + str(length) + ')');

  def getSeqNum(self):
    return self.seqnum;

  def __exit__(self, *argv):
    del self.data;
    del self.server;
    del self.socket;
    del self.seqnum;

  def __enter__(self):
    return self;

class InformationCollection(object):
  def __init__(self, server_address, handler):
    super(InformationCollection, self).__init__();
    self.server_address = server_address;

    self.__is_shut_down = threading.Event();
    self.__shutdown_request = False;
    self.status = False;

    self.__timeout = 0;
    self.socket = socket.socket(self.address_family, self.socket_type);

    self._handle = handler(self);

  def fileno(self):
    return self.socket.fileno();

  def _collection_forever(self, poll_interval = 0.5):
    self.__is_shut_down.clear();
    last = time.time();
    self.status = True;
    try:
      while not self.__shutdown_request:
        r, w, e = _eintr_retry(select.select, [self], [], [self],
                                       poll_interval)
        if self in e:
          raise Exception(e);

        if self in r:
          self._handle_report_noblock();

        if time.time() - last > self.__timeout:
          self._handle_timeout_noblock();
          last = time.time();
    except:
      logger.error(sys.exc_info());
      sys.exc_clear();
    finally:
      # print self.__class__.__name__,"_collection_forever stop"
      self._handle.finish();
      self.socket.close();
      self.__shutdown_request = True;
      self.status = False;
      self.__is_shut_down.set();

  def getShutdown(self):
    return self.__shutdown_request;

  def setShutdown(self, stat):
    self.__shutdown_request = stat;

  def collection_forever(self, poll_interval = 0.5):
    self._handle.setup();

    t = threading.Thread(target = self._collection_forever, args = (poll_interval,));
    t.setDaemon(True);
    t.start();

  def _handle_report_noblock(self):
    try:
      report, report_address = self.get_report()
    except socket.error as e:
      # import traceback
      # print errno.errorcode
      # traceback.print_exc(file=sys.stdout);
      import errno
      if errno.errorcode[10054] == errno.errorcode[e.errno]:
        raise e;
      return ;

    # try:
    self.process_report(report, report_address);
    # except:
    #   self.handle_error()

  def _handle_timeout_noblock(self):
    try:
      self._handle.timeout();
    except Exception as e:
      # self.handle_error();
      raise e;

  def shutdown(self):
    self._handle.finish();
    self.__shutdown_request = True;
    self.__is_shut_down.wait();

  def process_report(self, report, report_address):
    self._handle.handle(report, report_address);

  def handle_error(self):
    print '-'*40
    print 'Exception happened during processing of report ',
    import traceback
    traceback.print_exc()
    print '-'*40

  def setTimer(self, timeout):
    self.__timeout = timeout;

class InfomationCollectionHandler(object):
  def __init__(self, client):
    self.client = client
    self.server_address = client.server_address;
    self.socket = client.socket;

  def setup(self):
    # buildChain
    pass;

  def handle(self, report, report_address):
    pass;

  def timeout(self):
    # heartBeat
    pass;

  def finish(self):
    # broken chain
    pass;