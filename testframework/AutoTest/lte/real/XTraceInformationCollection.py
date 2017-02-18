# -*- coding: utf-8 -*- 
__all__ = ['XTraceInformationCollection', 'XTraceResource']

import os;
import sys;
import types;

import threading;

import xmltodict;

import ctypes;
import socket;
import struct;
import select;

from InformationCollection import  *;

def _eintr_retry(func, *args):
  while True:
    try:
      return func(*args)
    except (OSError, select.error) as e:
      if e.args[0] != errno.EINTR:
        raise

class Resource(object):

  OAM_TRACE_START_MSG = 3601;
  OAM_TRACE_START_ACK_MSG = 3602;
  OAM_TRACE_STOP_MSG = 3603;

  def __init__(self, client):
    self.client = client;
    self.localAddr = self.client.reportSocket.getsockname();

  def do_3602(self, report):
    (traceTaskID, result) = struct.unpack("!QI",report.data);
    if result != 0:
      self.client.shutdown();
      raise Exception('xtrace start fail. enb reaturn %d' %result);
    return None;

  def do_3617(self,req):
    (linkResult,) = struct.unpack("!I",req.data);

    if linkResult != 0:
      self.client.shutdown();
      raise Exception('xtrace link fail. enb return %d' %linkResult);

    '''
    U8  au8TraceTaskID[8];   
    U8  au8IPAdress[20];  /* 后台接收IP地址，IPV4使用a[0],a[1],a[2],a[3] */
    U16 u16PortId;          /* 后台接收PORT */
    U8  u8TraceType;        /* 0:TraceMe; 1:SinalTrace; ... */

    /* 信令跟踪过滤信息 */
    U8  u8TraceDepth;       /* 暂时不用，保留 */
    U8  u8ItfBitmap;        /* SinalTrace过滤条件:BitMap */
    U8  u8CellId;           /* SinalTrace过滤条件:Cell ID */
    U16 u16UEGid;           /* SinalTrace过滤条件:UE GID */    

    /* TraceMe过滤信息 */
    U8  u8Level;            /* TraceMe过滤条件:打印等级 */
    U8  u8SPIDNum;          /* 上报的模块个数，最多20个 */
    U16 au16SPID[20];       /* TraceMe过滤条件:打印模块SPID */
    '''

    flow = struct.pack('!Q5IH4BH2B20H'
                     , 1, struct.unpack("!I",socket.inet_aton(self.localAddr[0]))[0]
                     , 0, 0, 0, 0, self.localAddr[1], 1, 0xff, 0, 0xff, 0xffff
                     , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    return self.OAM_TRACE_START_MSG, flow;

  def do_3618(self, req):
      self.client.shutdown();
      raise Exception('xtrace offline ');

class XTraceInfomationCollectionHandler(InfomationCollectionHandler):

  OAM_TRACE_LINK_REQ_MSG = 3616;
  OAM_TRACE_LINK_ACK_MSG = 3617;
  OAM_TRACE_LINK_REL_IND_MSG = 3618;

  OAM_TRACE_START_MSG = 3601;
  OAM_TRACE_START_ACK_MSG = 3602;
  OAM_TRACE_STOP_MSG = 3603;
  OAM_TRACE_HEART_BEAT_MSG = 3604;
  OAM_TRACE_HEART_BEAT_ACK_MSG = 3605;

  OAM_TRACE_REPORT_MSG = 3608;

  OAM_TRACE_STOP_MSG = 3603;

  seqnum = 0;

  def __structHead(self, commandID, length):
    self.seqnum += 1;
    '''
    U16 u16MsgId;
    U16 u16MsgLen; 
    U32 u32SeqNum;
    '''
    # buf = ctypes.create_string_buffer(8 + length);
    flow = struct.pack("!HHI", commandID, length, self.seqnum);
    return flow;

  def setup(self):
    flow = self.__structHead(self.OAM_TRACE_LINK_REQ_MSG, 0);
    self.socket.send(flow);
    self.client.setTimer(30);
    self.lost_heartbeat_times = 0;
    self.report_count = 0;

  def handle(self, report, report_address):
    def getUdpData(report):
      return report.report[8:]
    req = Report(report, self.client.server_address, self.socket, getUdpData);

    if req.msgtype == self.OAM_TRACE_HEART_BEAT_ACK_MSG:
      self.lost_heartbeat_times = 0;
      return;

    func = self.client.matchMethod(req.msgtype);
    with req as request:
      message, flow = unpack(func(req));

    if message:
      if flow:
        head = self.__structHead(message, len(flow));
        self.socket.send(head + flow);
      else:
        head = self.__structHead(message, 0);
        self.socket.send(head);

  def process_report(self, report):
    data = report.recvfrom(8192);
    func = self.client.matchMethod('process_report');

    self.report_count += 1;
    message, flow = unpack(func(data[0]));

    if message:
      if flow:
        head = self.__structHead(message, len(flow));
        self.socket.send(head + flow);
      else:
        head = self.__structHead(message, 0);
        self.socket.send(head);

  def timeout(self):
    self.lost_heartbeat_times += 1;
    if self.lost_heartbeat_times >= 3:
      raise Exception('lost xtrace heartbeat');

    if self.report_count == 0:
      flow = self.__structHead(self.OAM_TRACE_LINK_REQ_MSG, 0);
      self.socket.send(flow);

    flow = self.__structHead(self.OAM_TRACE_HEART_BEAT_MSG, 0);
    self.socket.send(flow);

  def finish(self):
    flow = self.__structHead(self.OAM_TRACE_LINK_REL_IND_MSG, 0);
    try:
      self.socket.send(flow);
    except:
      pass;

class XTraceInformationCollection(InformationCollection):

  _proccessMap = [];
  max_packet_size = 8192;

  def __init__(self, host='17.31.16.230', port = 49152, handler = XTraceInfomationCollectionHandler, filename = ''):
    self.address_family = socket.AF_INET;
    self.socket_type = socket.SOCK_DGRAM;
    super(XTraceInformationCollection, self).__init__((host, port), handler);
    self.socket.connect(self.server_address);
    self.reportSocket = socket.socket(self.address_family, self.socket_type);
    self.reportSocket.connect(self.server_address);
    self.reportSocket.send('');

  def __recv_report(self, poll_interval = 0.5):
    try:
      while not self.getShutdown():
        r, w, e = _eintr_retry(select.select, [self.reportSocket], [], [],
                                       poll_interval)

        if self.reportSocket in r:
          self._handle.process_report(self.reportSocket);
    except:
      sys.exc_clear();
      # print sys.exc_info();
    finally:
      # self.shutdown();
      sys.exc_clear();
      self.reportSocket.close();
      pass;

  def collection_forever(self, poll_interval = 0.5):
    super(XTraceInformationCollection, self).collection_forever(poll_interval);

    t = threading.Thread(target = self.__recv_report, args = (poll_interval,));
    t.setDaemon(True);
    t.start();

  def get_report(self):
    data, addr = self.socket.recvfrom(self.max_packet_size);
    return data, addr;

  def process(self, proccessClass):
    self._proccessMap.append(proccessClass);

  def matchMethod(self, msgtype, req = None):
    nfunc = 'do_'+str(msgtype);
    for pro in self._proccessMap:
      if nfunc in dir(pro):
        if type(pro) is types.TypeType:
          func = getattr(pro(req), nfunc);
        else:
          func = getattr(pro, nfunc);

        if callable(func):
          return func;
        else:
          raise Exception('not callable '+str(func));
    raise Exception('not found msg ' + str(msgtype) + ' process function');

class XTraceResource(Resource):
  def __init__(self, client, outfile = None):
    super(XTraceResource, self).__init__(client);

    self.fileType = 0xDEDEDEDE;
    self.fileExName = '.xst';
    self.recordNum = 0;
    self.fileLen = 16;

    if not outfile:
      outfile = os.tmpnam();

    self.outfile = open(outfile, "wb");

  def do_3608(self, report):
    self.do_process_report(report);

  def do_process_report(self, report):
    self.fileLen += len(report) + 4;
    self.recordNum += 1;
    self.outfile.seek(0, os.SEEK_SET);
    self.outfile.write(struct.pack('I4sII', self.fileType, self.fileExName, self.recordNum, self.fileLen));

    '''
    UInt16 u16RecordSpecID;
    UInt16 u16RecordLength;
    '''
    self.outfile.seek(0, os.SEEK_END);
    self.outfile.write(struct.pack('HH', 0xBCBC, len(report)));

    self.outfile.write(report);
    self.outfile.flush();

    return None;

if __name__ == "__main__":
  xtrace = XTraceInformationCollection();
  xtrace.process(XTraceResource(xtrace, outfile='a.xst'));
  xtrace.collection_forever();

  try:
      while True:
        threading.Event().wait(15);
  finally:
    xtrace.shutdown();

  xtrace.shutdown();