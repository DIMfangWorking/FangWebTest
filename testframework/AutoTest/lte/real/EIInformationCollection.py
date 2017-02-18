# -*- coding: utf-8 -*- 
__all__ = ['EIInformationCollection', 'EIResource']

import os;
import sys;
import time;
import datetime;

import json;

import threading;
import types;

import xmltodict;

import ctypes;
import socket;
import struct;
import select;

from InformationCollection import  *;
from EIBasic import *;
from EIDetail import *;

from logger import getLogger;
logger = getLogger();

class Resource(object):

  OAM_MONITOR_EI_BASIC_START_MSG = 3633;
  OAM_MONITOR_EI_ALL_STOP_MSG = 3635;
  OAM_MONITOR_EI_BASIC_DATA_REPORT_MSG = 3637;

  OAM_MONITOR_EI_SPECIFIC_START_MSG = 3634;
  OAM_MONITOR_EI_SPECIFIC_STOP_MSG = 3636;
  OAM_MONITOR_EI_SPECIFIC_DATA_REPORT_MSG = 3638;

  def __init__(self, client):
    self.client = client;

  def do_3620(self, req):
    return self.OAM_MONITOR_EI_BASIC_START_MSG;

  def do_3622(self, req):
    self.client.shutdown();
    raise Exception('ei offline ');

  def stop(self):
    pass;

class EIInfomationCollectionHandler(InfomationCollectionHandler):

  OAM_MONITER_LINK_REQ_MSG = 3619;
  OAM_MONITER_LINK_ACK_MSG = 3620;
  OAM_MONITER_LINK_REL_IND_MSG = 3621;
  OAM_EI_TCP_REL_NOTIFY_MSG = 3622;

  OAM_TRACE_HEART_BEAT_MSG = 3604;
  OAM_TRACE_HEART_BEAT_ACK_MSG = 3605;
  
  OAM_MONITOR_EI_BASIC_START_MSG = 3633; 
  OAM_MONITOR_EI_ALL_STOP_MSG = 3635;
  OAM_MONITOR_EI_BASIC_DATA_REPORT_MSG = 3637;

  OAM_MONITOR_EI_SPECIFIC_START_MSG = 3634;
  OAM_MONITOR_EI_SPECIFIC_STOP_MSG = 3636;
  OAM_MONITOR_EI_SPECIFIC_DATA_REPORT_MSG = 3638;

  seqnum = 0;

  def __structHead(self, commandID, length):
    self.seqnum += 1;
    '''
    U16 u16MsgId;
    U16 u16MsgLen; 
    U32 u32SeqNum;
    '''
    flow = struct.pack("!HHI", commandID, length, self.seqnum);

    logger.debug('__structHead id %r flow len %r', commandID, len(flow));

    return flow;

  def setup(self):
    flow = self.__structHead(self.OAM_MONITER_LINK_REQ_MSG, 0);
    self.socket.send(flow);
    self.client.setTimer(2);
    self.lost_heartbeat_times = 0;
    self.link_ack_count = 0;
    self.basic_report_count = 0;

  def handle(self, report, report_address):
    def getTcpData(report):
      recvLength = report.length;
      flow = '';

      while recvLength > 0:
        tmp = report.socket.recv(recvLength);
        recvLength -= len(tmp);
        flow += tmp;

      return flow;

    req = Report(report, self.client.server_address, self.socket, getTcpData);

    if req.msgtype == self.OAM_TRACE_HEART_BEAT_ACK_MSG:
      self.lost_heartbeat_times = 0;
      return;

    if req.msgtype == self.OAM_MONITER_LINK_ACK_MSG:
      self.link_ack_count += 1;

    if req.msgtype == self.OAM_MONITOR_EI_BASIC_DATA_REPORT_MSG:
      self.basic_report_count += 1;

    func = self.client.matchMethod(req.msgtype);
    with req as request:
      message, flow = unpack(func(req));

    if message:
      head = self.__structHead(message, 0);
      if flow:
        self.socket.send(head + flow);
      else:
        self.socket.send(head);

  def startAllEIDetail(self, msg = None):
    func = self.client.matchMethod(self.OAM_MONITOR_EI_SPECIFIC_START_MSG);
    message, flow = unpack(func(msg));

    if message:
      if flow:
        head = self.__structHead(message, len(flow));
        self.socket.send(head + flow);
      else:
        head = self.__structHead(message, 0);
        self.socket.send(head);

  def stopAllEIDetail(self, msg = None):
    func = self.client.matchMethod(self.OAM_MONITOR_EI_SPECIFIC_STOP_MSG);
    message, flow = unpack(func(msg));

    if message:
      head = self.__structHead(message, 0);
      if flow:
        self.socket.send(head + flow);
      else:
        self.socket.send(head);

  def timeout(self):
    self.lost_heartbeat_times += 1;

    if self.link_ack_count == 0 :
      self.client.setTimer(5);
      flow = self.__structHead(self.OAM_MONITER_LINK_REQ_MSG, 0);
      self.socket.send(flow);
    elif self.basic_report_count == 0:
      if self.lost_heartbeat_times >= 3:
        self.lost_heartbeat_times = 0;
        self.client.setTimer(10);
        flow = self.__structHead(self.OAM_MONITER_LINK_REQ_MSG, 0);
        self.socket.send(flow);
        return;
      else:
        self.client.setTimer(15);
        logger.error("ei not report basic info, self.basic_report_count = %r", self.basic_report_count);
        flow = self.__structHead(self.OAM_MONITOR_EI_BASIC_START_MSG, 0);
        self.socket.send(flow);
    else:
      self.client.setTimer(20);

    flow = self.__structHead(self.OAM_TRACE_HEART_BEAT_MSG, 0);
    self.socket.send(flow);

  def finish(self):
    flow = self.__structHead(self.OAM_MONITER_LINK_REL_IND_MSG, 0);
    try:
      self.socket.send(flow);
    except:
      pass;

class EIInformationCollection(InformationCollection):

  _proccessMap = [];

  max_packet_size = 8;

  def __init__(self, host='17.31.16.230', port = 49152, handler = EIInfomationCollectionHandler):
    self.address_family = socket.AF_INET;
    self.socket_type = socket.SOCK_STREAM;
    super(EIInformationCollection, self).__init__((host, port), handler);
    self.socket.connect(self.server_address);
    # self.socket.setblocking(False);
    self.socket.ioctl(socket.SIO_KEEPALIVE_VALS, (1, 5000, 1000));
    self.socket.settimeout(5);

  def get_report(self):
    data = self.socket.recv(self.max_packet_size);
    while True:
      if len(data) < self.max_packet_size:
        data = self.socket.recv(self.max_packet_size - len(data));
      else:
        break;
    return data, self.server_address;

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

  def startAllDetail(self, msg = None):
    self._handle.startAllEIDetail(msg);

  def shutdown(self):
    InformationCollection.shutdown(self);

class EIResource(Resource):

  def __init__(self, client, outpath = None, reportMethod = None):
    super(EIResource, self).__init__(client);
    self.__basicParse = EIBasicParse();
    self.__EIDetailSave = EIDetailSave(outpath);
    '''
    buff = ''
    for line in open(xmlfile):
      buff += line;
    result = xmltodict.parse(buff);
    import json
    print(json.dumps(result, indent = 4));
    self.conf = result;
    '''

    self.outpath = outpath;
    self.reportMethod = reportMethod;

    self._report_1m_ei();

    self.lastWriteFileTime = 0;
    self.fileType = 0xDEDEDEDE;
    self.fileLen = 12;
    self.recordNum = 0;

    if not outpath:
      outfile = os.tmpnam();

    outfile = outpath + 'ei_basic_' + datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S') + '.bei'

    self.outfile = open(outfile, "wb");

  def _reportEiBasic(self):
    result = self.__basicParse.getJson();
    if hasattr(self, 'reportMethod') and self.reportMethod:
      try:
        self.reportMethod(result);
      except:
        e = sys.exc_info()
        logger.error("%r \r\n %r\r\n %r", e[0], e[1], e[2]);
    else:
      print json.dumps(result, default=lambda obj : obj.__dict__);

  def _writeFile(self, cellNum, data):
    if not data or len(data) < 0x124:
      return;

    '''
    UInt32 u32FileType;
    UInt32 u32FileLen;
    UInt32 u32RecordNum;
    '''
    self.fileLen += len(data) + 16;
    self.recordNum += 1;
    self.outfile.seek(0, os.SEEK_SET);
    self.outfile.write(struct.pack('III', self.fileType, self.fileLen, self.recordNum));

    '''
    UInt16 u16RecordSpecID;
    UInt16 u16CellNum;
    UInt32 u32RecordLength;
    double dTime; 
    '''
    self.outfile.seek(0, os.SEEK_END);
    self.outfile.write(struct.pack('HHId', 0xBCBC, cellNum, len(data), long(time.time())));

    self.outfile.write(data);
    self.outfile.flush();

  def _report_1m_ei(self):
    logger.debug("report ei basic");
    if hasattr(self, 'timer') and self.timer:
      self.timer.cancel();
    self.timer = threading.Timer(1, self._report_1m_ei);
    self.timer.start();

    (cellNum, flow) = self.__basicParse.getFlow();
    if flow:
      self._writeFile(cellNum, flow);
      self._reportEiBasic();
    else:
      logger.debug('cellNum %d flow len %d', cellNum, 0)

  def do_3637(self, report):
    lengthTotal = 0;
    lengthData = len(report.data);
    while lengthTotal < lengthData:
      data = report.data[lengthTotal:];
      (eiMsg, ariTime, sn, num, length) = struct.unpack("!IIIHH", data[:16]);

      logger.debug("EIResource %r", (eiMsg, ariTime, sn, num, length));

      self.__basicParse.parseMsg((eiMsg, ariTime, sn, num, length), data[16 : 16 + length]);

      lengthTotal += 16 + length;

    return None;

  def do_3634(self, msg = None):
    flow = '';
    self.eidetailFileNo = { };
    for i in msg:
      '''
      U16 u16MajorId;
      U16 u16MinorId;
      '''
      flow += struct.pack("!HH", msg[i]['DspId'], msg[i]['CoreId']);

      '''
      U32 u32EiMsgId; 
      U16 u16TagNum;
      U16 au16Tag[_MAX_TAG_PER_EI_MSG_];/* Tag列表最多携带100个 */
      U8  u8Resv1[2];
        
      /* 下面的小区和UE都是用于过滤条件 */
      U16 u16CellNum;   /* 过滤小区个数 */
      U8  au8CellId[_MAX_CELL_NUM_IN_ENB_];/*Cell列表最多携带3个*/
      U8  u8Resv2[3];
      U16 u16UeNum;     /* 过滤UE个数 */
      U16 au16Gid[_MAX_UE_GID_IN_EI_MSG_];/*Gid列表对多携带40个*/
      U16 u16Resvd;
      '''
      flow += struct.pack("!IH", msg[i]['MsgId'], len(msg[i]['Tlv']));

      self.eidetailFileNo[msg[i]['MsgId']] = { };

      # print msg[i]
      self.__EIDetailSave.setMsg(msg[i]);

      for index in range(len(msg[i]['Tlv'])):
        flow += struct.pack("!H", msg[i]['Tlv'][index]['id']);

      for index in range(100 - len(msg[i]['Tlv'])):
        flow += struct.pack("!H", 0);

      flow += struct.pack("!2B", 0, 0);

      flow += struct.pack("!H3B", 0, 0, 0, 0);
      flow += struct.pack("!3B", 0, 0, 0);
      flow += struct.pack("!H", 0);

      for i in range(40):
        flow += struct.pack("!H", 0);

      flow += struct.pack("!H", 0);

    return self.OAM_MONITOR_EI_SPECIFIC_START_MSG, flow;

  def do_3636(self, msg = None):
    return self.OAM_MONITOR_EI_SPECIFIC_STOP_MSG;

  def do_3638(self, report):
    lengthProc = 0;
    while lengthProc < len(report.data):
      (eiMsg, ariTime, sn, num, length) = struct.unpack("!IIIHH", report.data[lengthProc : lengthProc + 16]);
      lengthProc += length + 16;
      self.__EIDetailSave.write((eiMsg, ariTime, sn, num, length), report.data[lengthProc - length - 16 : lengthProc]);

  def stop(self):
    self.__basicParse.stop();

if __name__ == "__main__":
  import redis;
  Redis = redis.StrictRedis('172.31.4.58', 6379, db = 2);
  ei = EIInformationCollection();
  # ei.process(EIResource(ei, outfile='./', redis = Redis, redisKey = 'test'));
  ei.process(EIResource(ei, outpath='./'));
  ei.collection_forever();

  result = {"ei" : ei}

  def __monitorEiStatus(ei):
    while True:
      print 'ei connect has been broken',ei['ei'].status
      if not ei['ei'].status :
        print 'ei connect has been broken'
        try:
          ei['ei'] = EIInformationCollection();
          ei['ei'].process(EIResource(ei, outpath='./'));
          ei['ei'].collection_forever();
        except:
          import traceback
          traceback.print_exc(file=sys.stdout);
          pass;
      threading.Event().wait(1);

  eiThread = threading.Thread(target = __monitorEiStatus, args = (result,));
  #t.setDeamon(True);
  eiThread.start();

  try:
    while True:
      threading.Event().wait(5);
  finally:
    ei.shutdown();