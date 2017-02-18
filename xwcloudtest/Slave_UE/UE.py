#-*- coding:utf-8 -*-
__version__ = "0.1"
__all__ = ["UE", "Cell", "eNB"]
__author__ = "guowei"

import gc;

import time;
import socket;
import struct;
import binascii;
import ctypes;
import string;
import json;
import sys;

import httplib;
import traceback;
import socket;
import struct;
import threading;
import traceback;
import shlex;
import subprocess;

import GlobalShare;

class shutdownhttplib(httplib.HTTPConnection):
  def __init__(self, host, port=None, strict=None, timeout=socket._GLOBAL_DEFAULT_TIMEOUT,
               source_address=None):
    httplib.HTTPConnection.__init__(self, host, port, strict, timeout,
                                    source_address)
  def connect(self):
    httplib.HTTPConnection.connect(self);
    self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1);
    self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack('ii', True,0));
    
  def close(self):
    self.sock.shutdown(socket.SHUT_RDWR);
    httplib.HTTPConnection.close(self);

class Singleton(type):
  def __init__(cls,name,bases,dict):
    super(Singleton, cls).__init__(name, bases,dict);
    clsDict = getattr(cls, cls.__name__ + "Dict");
    clsDict = {};

  def __call__(cls, *args, **kwargs):
    clsDict = getattr(cls, cls.__name__ + "Dict");
    
    id = args[0];

    if cls == Cell:
      id = 'enb.'+str(args[1].id)+'cell.'+str(args[0]);
    
    if id in clsDict.keys():
      return clsDict[id]

    obj = super(Singleton, cls).__call__(*args, **kwargs);
    clsDict[id] = obj;

    return obj;

class eNB(object):
  __metaclass__ = Singleton;
  eNBDict = {};

  def __init__(self, eNBId):
    self.id = eNBId;
    self.cellDict = {};
    self.cellList = [];

  def __str__(self):
    return "enb id = %x" %self.id;

  def __del__(self):
    print "del enb id = %x" %self.id;

  def addCell(self, cell):
    self.cellDict[cell.id] = cell;
    self.cellList.append(cell);

  def delCell(self, cell):
    del self.cellDict[cell.id];
    del self.cellList[self.cellList.index(cell)];
    if len(eNBDict) == 0:
      del eNB.eNBDict[self.id];

  def getCell(self, id = None):
    if id is None:
      return self.cellList;

    return self.cellDict[id] if id in self.cellDict.keys() else None;

  def getCellCount(self):
    return len(self.cellList);

class Cell(object):
  __metaclass__ = Singleton;
  CellDict = {};

  def __init__(self, id, enb = None, pci = None):
    self.id = id;
    self.enb = enb;
    self.pci = pci;

    if enb is not None:
      enb.addCell(self);

    self.ueDict = [];

  def __str__(self):
    return "cell id = %d" %self.id;

  def __del__(self):
    print "del cell id = %d" %self.id;

  def addUE(self, ue):
    self.ueDict.append(ue);

  def delUE(self, ue):
    index = self.ueDict.index(ue);
    del self.ueDict[index];

  def getUECount(self):
    return len(self.ueDict);

  def getUE(self, count = None):
    if count is None:
      return self.ueDict;
    return self.ueDict[:count];

class UE(object):
  __metaclass__ = Singleton;
  # 类属性
  seqnum = 0;
  UEDict = {};
  taskId = 0;
  taskDict = {};

  timeout = 20;

  COMMAND_Attach = 1;
  COMMAND_Detach = 2;
  COMMAND_ULPing = 3;
  COMMAND_ULTCP = 4;
  COMMAND_ULUDP = 5;
  COMMAND_DLTCP = 6;
  COMMAND_DLUDP = 7;
  COMMAND_twoWayTcp = 8;
  COMMAND_twoWayUdp = 9;
  # 视频回传 = 10
  # 视频下载 = 11
  COMMAND_Root = 12;

  #__slots__ = ('IMSI', 'enb', 'pci', 'ip', 'socket', 'client')

  def __init__(self, IMSI, eNBId, cellId, pci, socket = None, client = None, version = None):
    self.IMSI = IMSI;
    self.enb = eNB(eNBId);
    self.cell = Cell(cellId, self.enb, pci);
    self.ip = client[0];
    self.port = client[1];
    self.socket = socket;
    self.client = client;
    self.version = version;
    self.thrput = [];
    self.cell.addUE(self);
    self.task = {};
    self.__sendHttp__('/UE/Online', {"IMSI": self.IMSI, "enb":self.enb.id, "cell" : self.cell.id, "pci" : self.cell.pci, "ip" : self.ip});

    self.timer = None;

    self.heartbeat();
    print 'online', self

  def setCtrlSocket(self, socket):
    self.socket = socket;

  def chooseCell(self, enbid, cellid, pci):
    if self.enb.id == enbid and self.cell.id == cellid:
      return;
    
    self.cell.delUE(self);
    
    self.enb = eNB(eNBId);
    self.cell = Cell(cellId, self.enb, pci);
    self.cell.addUE(self);

  def heartbeat(self):
    if self.timer:
      self.timer.cancel();
    self.timer = threading.Timer(UE.timeout, self.offline);
    self.timer.start();

  def setVersion(self, version):
  	self.version = version;

  def notifyThr(self, RSRP, ULThrput, DLThrput):
    t = time.time();

    info = {'RSRP' : RSRP, 'ULThrput' : ULThrput, 'DLThrput' : DLThrput, 'time': t};
    self.thrput.append(info);

    info["IMSI"] = self.IMSI;

    self.__sendHttp__('/UE/BandWitdth', info);
    for thr in self.thrput:
      if t - thr['time'] > 60 * 60 * 12: # 12hour
        del self.thrput[self.thrput.index(thr)];
      else:
        break;

  def __del__(self):
    print '__del__'
    pass;

  def __str__(self):
    return "enb = %d cell = %3d imsi = %16.16d pci = %3d ip = %s ver = %d" %(self.enb.id, 
      self.cell.id, self.IMSI, self.cell.pci, self.ip, self.version);

  def __repr__(self):
    return "enb = %x cell = %3d imsi = %16.16d pci = %3d ip = %s ver = %d" %(self.enb.id,
      self.cell.id, self.IMSI, self.cell.pci, self.ip, self.version);

  def getCell(self):
    return self.cell;

  def __sendHttp__(self, url, params):
    config = GlobalShare.getShareObj()['config'];
    try:
      conn = shutdownhttplib(config['Master']['host'], config['Master']['port']);
      conn.request("POST", url, json.dumps(params), {"Content-type": "application/json"});
      response = conn.getresponse();
      data = response.read();
      conn.close();
      return data;
    except:
      #print 'send fail %s %s' %(url, json.dumps(params))
      traceback.print_exc(file=sys.stdout)
      return None;

  def __IMSIToBCD__(self):
    return string.atoi(str(self.IMSI), 16);
    
  def __structHead__(self, commandID, length):
    self.seqnum = UE.seqnum;
    UE.seqnum += 1;
    '''
    U16 u16MsgId;
    U16 u16MsgLen; 
    U32 u32SeqNum;

    U8 u8CtrlOptType;
    U8 u8CommandNum;
    U16 u16Rsvd;

    U8 u8CommandID;
    U8 u8Times;
    U16 u16Delay;
    U32 u32ExeTime;
    '''
    buf = ctypes.create_string_buffer(8 + 12 + length);

    EV_CTRL_CMD_MSG = 5;

    struct.pack_into("!2HI2BH2BHI", buf, 0, EV_CTRL_CMD_MSG, 12 + length, self.seqnum,
              0x0, 0x1, 0x0, commandID, 0x1, 0x0, 0xffffffff);
    return buf;

  def __createTask__(self, opt, **kwargs):
    print 'create task %d' %self.IMSI;
    UE.taskId += 1;
    self.task["id"] = UE.taskId;
    self.task["opt"] = opt;
    self.task["start"] = time.time();

    self.task = dict(self.task.items() + kwargs.items());

    UE.taskDict[self.task["id"]] = self.IMSI;

    while True:
      try:
        if self.task["result"] == 0:
          print 'create task %d id %d' %(self.IMSI, self.task["id"]);

          if self.timer:
            self.timer.cancel();
            self.timer = None

          return self.task["id"];
        else:
          raise Exception("create task not success %#x" %self.task["result"]);
      except KeyError:
        time.sleep(0.01);

  def __stopTask__(self, process):
    try:
      process.kill();
      process.terminate();
    except:
      pass

    if not self.timer:
      self.timer = threading.Timer(UE.timeout, self.offline);
      self.timer.start();

  def __startTask__(self, cmd, duration):
    p = subprocess.Popen(shlex.split(cmd));
    timer = threading.Timer(duration + 5, self.__stopTask__, [p]);
    timer.start();
    self.task["process"] = p;
    self.task["timer"] = timer;

  def __startIperf__(self, cmd, duration):
    threading.Event().wait(2);

    print cmd
    self.__startTask__(cmd, duration);

  def ping(self, pdnIP, duration):
    '''
    U32 u32PDNIP;
    U16 u16Rcv; 
    U16 u16Duration;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    (ip,) = struct.unpack("!I",socket.inet_aton(pdnIP));

    flow = self.__structHead__(UE.COMMAND_ULPing, 8);
    struct.pack_into("I", flow, -8, ip);
    struct.pack_into("!2H", flow, -4, 0x0000, duration);
    self.socket.sendto(flow.raw, self.client);

    return self.__createTask__('ping', pdnIP = pdnIP, duration = duration);

  def downTcp(self, port, duration):
    '''
    U16 u16Port; 
    U16 u16Duration;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_DLTCP,4);
    struct.pack_into("!2H", flow, -4, port, duration);
    self.socket.sendto(flow.raw, self.client);

    cmd = 'iperf -c %s -p %d -i 1 -w 512k -t %d' %(self.ip, port, duration + 5);
    print cmd

    task_id = self.__createTask__('dltcp', port = port, duration = duration)

    self.__startTask__(cmd, duration);

    return task_id;

  def upTcp(self, pdnip, port, duration):
    '''
    U32 u32PDNIP;
    U16 u16Port; 
    U16 u16Duration;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_ULTCP,8);
    (ip,) = struct.unpack("!I",socket.inet_aton(pdnip));

    cmd = 'iperf -s %s -p %d -i 1 -w 512k -t %d' %(pdnip, port, duration + 5);
    print cmd
    self.__startTask__(cmd, duration);
    
    struct.pack_into("I",flow, -8, ip);
    struct.pack_into("!HH",flow, -4, port, duration);
    self.socket.sendto(flow.raw, self.client);

    return self.__createTask__('ultcp', pdnip = pdnip, port = port, duration = duration);

  def upUdp(self, pdnip, port, bandwidth, duration):
    '''
    U32 u32PDNIP;
    U16 u16Port; 
    U16 u16Duration;
    U32 u32BandWidth;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_ULUDP,12)
    (ip,) = struct.unpack("!I",socket.inet_aton(pdnip));

    cmd = 'iperf -u -s %s -p %d -i 1 -l 512 -t %d' %(pdnip, port, duration + 5);
    print cmd
    self.__startTask__(cmd, duration);

    struct.pack_into("I", flow, -12, ip);
    struct.pack_into("!HHI", flow, -8, port, duration, bandwidth);
    self.socket.sendto(flow.raw, self.client);

    return self.__createTask__('uludp', pdnip = pdnip, port = port, duration = duration, bandwidth = bandwidth);

  def downUdp(self, port, bandwidth, duration):
    '''
    U16 u16Port; 
    U16 u16Duration;
    U32 u32BandWidth;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_DLUDP,8);
    struct.pack_into("!HHI", flow, -8, port, duration, bandwidth);
    self.socket.sendto(flow.raw, self.client);

    cmd = 'iperf -u -c %s -p %d -b %dk -i 1 -l 512 -t %d' %(self.ip, port, bandwidth, duration + 5);
    print cmd
    task_id = self.__createTask__('dludp', port = port, duration = duration, bandwidth = bandwidth);
    
    self.__startTask__(cmd, duration);

    return task_id;

  def twoWayTcp(self, pdnip, ulport, dlport, duration):
    '''
    U32 u32PDNIP;
    U16 u16ULPort;
    U16 u16DLPort; 
    U16 u16Duration;
    U16 u16Reserved;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_twoWayTcp,12);
    (ip,) = struct.unpack("!I",socket.inet_aton(pdnip));

    cmd = 'iperf -d -s %s -p %d -t -i 1 -w 512k -t %d' %(pdnip, ulport, duration + 5);
    print cmd
    self.__startTask__(cmd, duration);

    struct.pack_into("I", flow, -12, ip);
    struct.pack_into("!4H", flow, -8, ulport, dlport, duration, 0x0);
    self.socket.sendto(flow.raw, self.client);
    return self.__createTask__('dultcp', pdnip = pdnip, ulport = ulport, dlport = dlport, duration = duration);

  def twoWayUdp(self, pdnip, ulport, dlport, ulbandwidth, dlbandwidth, duration):	
    '''
    U32 u32PDNIP;
    U16 u16ULPort;
    U16 u16DLPort; 
    U32 u32ULBandWidth;
    U32 u32DLBandWidth;
    U16 u16Duration;
    U16 u16Reserved;
    '''
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);
    flow = self.__structHead__(UE.COMMAND_twoWayUdp,20) 
    (ip,) = struct.unpack("!I",socket.inet_aton(pdnip));

    cmd = 'iperf -u -d -s %s -p %d -u -i 1 -l 512 -t %d' %(pdnip, ulport, duration + 5);
    print cmd
    self.__startTask__(cmd, duration);

    struct.pack_into("I", flow, -20, ip);
    struct.pack_into("!2H2I2H", flow, -16, ulport, dlport, ulbandwidth, dlbandwidth, duration, 0x0);
    self.socket.sendto(flow.raw, self.client);
    return self.__createTask__('duludp', pdnip = pdnip, ulport = ulport, dlport = dlport, duration = duration);

  def reboot(self):
    if len(self.task) > 0:
      raise Exception("performing task. task id : %d" %self.task["id"]);

    flow = self.__structHead__(UE.COMMAND_Root,0) 
    self.socket.sendto(flow.raw, self.client);

    return None;

  def getTaskResult(self, optionID):
    if len(self.task) == 0 or optionID != self.task["id"] :
      raise Exception('not found option id : %d imsi %d' %(optionID, self.IMSI));

    start = self.task['start'];
    end = self.task['start'] + self.task['duration'];

    if end > time.time():
      raise Exception('The task is not finished yet. ');

    result = {"optionType" : self.task['opt'], "ULThrput" : 0, "DLThrput" : 0, "count" : 0};
    for thr in self.thrput:
      if thr['time'] >= start and thr['time'] <= end:
        if thr['ULThrput'] != 0 or thr['DLThrput'] !=0:
          result["ULThrput"] += thr['ULThrput'];
          result["DLThrput"] += thr['DLThrput'];
          result["count"] += 1;
          result["RSRP"] = thr["RSRP"];
      elif thr['time'] > end:
        break;

    if result["count"] > 0:
      result["ULThrput"] /= result["count"];
      result["DLThrput"] /= result["count"];


    # unit MB    
    result["ULThrput"] /= 100;
    result["DLThrput"] /= 100;

    self.task = {};

    del UE.taskDict[optionID];

    return result;

  def offline(self):
    print 'offline', self

    try :
      if self.timer:
        self.timer.cancel();
      self.timer = None;
    except:
      pass

    if self.task:
      self.task['result'] = -0x6655;

      try:
        self.task['timer'].cancel();
      except:
        pass;

      try:
        self.task['process'].terminate();
      except:
        pass;

    self.__sendHttp__('/UE/Offline', {"IMSI" : self.IMSI});

    del UE.UEDict[self.IMSI];
    self.cell.delUE(self);

  def checkCmd(self, seqnum):
    if self.seqnum == seqnum :
      self.task['result'] = 0;
    else:
      raise Exception('错误的seqnum:'+str(seqnum));
