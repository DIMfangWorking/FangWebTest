# -*- coding:utf-8 -*-

import os
import sys
import socket
import subprocess
import struct
import traceback

import pdb
import datetime
import signal
import shlex
import threading;

import json

import redis;

from logger import getLogger;
logger = getLogger();

from DbManager import *;
from Atom import Atom;
from SerialRead import SerialRead;

from EIInformationCollection import *;
from XTraceInformationCollection import *;
from LMTInterface import RemoteRequest;

class AtomEnb(Atom):
  def __init__(self, item, mng):
    self.lock = threading.Lock();
    self.lock.acquire();
    self.mng = mng;
    self.testMng = mng.testMng

    #log = self.mng.logPath + os.sep + 'serial_' + self.mng.enbId + '_'+ self.mng.type + '_'+ self.mng.startTime + '.log';    

    self.lmtInterface = RemoteRequest('17.31.16.230', '80');

    #self.s = SerialRead(open(log, 'w+', 0), self.lock);
    #self.s.start();

    self.redis = redis.StrictRedis(socket.inet_ntoa(self.testMng.redis), self.testMng.rport, db = 2);
    self.redisKey = self.testMng.rkey;

    self.ei_basic = [];
    self.__EIBasicReportCallback = None;

    try:
      self.__stopMonitor = False;
      self.__startEi();
      self.__startXtrace();
    except:
      self.eiThread = threading.Thread(target = self.__monitorEiStatus);
      #t.setDeamon(True);
      self.eiThread.start();
      self.xTraceThread = threading.Thread(target = self.__monitorXTraceStatus);
      #t.setDeamon(True);
      self.xTraceThread.start();

    self.dbm = DBOption(self.testMng, self.mng);

  def regEIBasicCallback(self, func):
    logger.debug('AtomEnb regEIBasicCallback %r', func)
    self.__EIBasicReportCallback = func;

  def clearEIBasicCallback(self):
    logger.debug('AtomEnb clearEIBasicCallback %r', self.__EIBasicReportCallback)
    self.__EIBasicReportCallback = None;

  def __EIBasicReport(self, obj):
    self.ei_basic.append(obj);

    if self.__EIBasicReportCallback:
      logger.debug('AtomEnb call EIBasicReportCallback')
      self.__EIBasicReportCallback(obj);

    if self.redis and self.redisKey:
      logger.debug('AtomEnb redis report')
      self.redis.rpush(self.redisKey, json.dumps(obj, default=lambda obj : obj.__dict__));

  def __startEi(self):
    eilog = self.mng.logPath + os.sep;
    self.ei = EIInformationCollection();

    self.ei_basic = [];
    self.redis.delete(self.testMng.rkey)

    self.eiResource = EIResource(self.ei, outpath = eilog, reportMethod = self.__EIBasicReport);
    self.ei.process(self.eiResource);
    self.ei.collection_forever();

    logger.info('AtomEnb new ei %r', self.ei);

    if not hasattr(self, 'eiThread') or not self.eiThread.isAlive():
      self.eiThread = threading.Thread(target = self.__monitorEiStatus);
      #t.setDeamon(True);
      self.eiThread.start();

  def __startXtrace(self):
    xtracelog = self.mng.logPath + os.sep + 'sig_' + self.mng.enbId + '_'+ self.mng.startTime + '.xst';
    self.xtrace = XTraceInformationCollection();
    self.xtResource = XTraceResource(self.xtrace, outfile=xtracelog)
    self.xtrace.process(self.xtResource);
    self.xtrace.collection_forever();

    logger.info('AtomEnb new xtrace %r', self.xtrace);

    if not hasattr(self, 'xTraceThread') or not self.xTraceThread.isAlive():
      self.xTraceThread = threading.Thread(target = self.__monitorXTraceStatus);
      #t.setDeamon(True);
      self.xTraceThread.start();

  def __monitorEiStatus(self):
    while not self.__stopMonitor:
      if not hasattr(self, 'ei') or not self.ei.status :
        # print 'ei connect has been broken'
        try:
          self.__startEi();
        except:
          # import traceback
          # traceback.print_exc(file=sys.stdout);
          # sys.stdout.flush();
          pass;
      threading.Event().wait(5);

  def __monitorXTraceStatus(self):
    while not self.__stopMonitor:
      if not hasattr(self, 'xtrace') or not self.xtrace.status :
        # print 'xtrace connect has been broken'
        try:
          self.__startXtrace();
        except:
          # import traceback;
          # traceback.print_exc(file=sys.stdout);
          # sys.stdout.flush();
          pass;
      threading.Event().wait(5);

  def Run(self):
    RemoteRequest('17.31.16.230', '80').uploadWBS();

    hexIpInt = int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0]));
    hexIpGw = (hexIpInt & 0xffffff00) | 0xfe;
    hexIp = '%x' %hexIpInt;
    hexIpGw = '%x' %hexIpGw;
    ipv4 = self.dbm.getTable('T_IPV4');
    ipv4.overwrite({}, {'u8VlanIndex' : 0, 'au8IPAddr' : hexIp, 'au8NetMask' : 'ffffff00', 'au8GWAddr' : hexIpGw});

    hexIp = '%x' %int(socket.ntohl(struct.unpack('I',self.testMng.epcip)[0]));
    sctp = self.dbm.getTable('T_SCTP');
    sctp.update({}, {'au8DstIP1' : hexIp});

    omc = self.dbm.getTable('T_OMC');
    omc.update({'u8OmcID' : 1}, {'u8eNBIPID' : 1, 'au8OmcServerIP' : hexIp, 'u16SrcPort' : 4999, 'u16DstPort' : 4999});

    enbpara = self.dbm.getTable('T_ENB_PARA');
    enbpara.overwrite({}, {'u32eNBId' : int(self.mng.enbId), 'au8eNBName' : self.mng.enbName});

    cellpara = self.dbm.getTable('T_CEL_PARA');
    cellpara.update({'u8CId' : 252 }, {'u16PhyCellId' : self.mng.phyCellId, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
    cellpara.update({'u8CId' : 253 }, {'u16PhyCellId' : self.mng.phyCellId1, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
    cellpara.update({'u8CId' : 254 }, {'u16PhyCellId' : self.mng.phyCellId2, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});

    cellpara = self.dbm.getTable('T_SYS_PARA');
    cellpara.update({'u8Indx' : 0 }, {'u8ServeMod' : 1});

    celldlpc = self.dbm.getTable('T_CEL_DLPC');
    celldlpc.update({'u8CId' : 252 }, {'u16CellTransPwr' : 257});
    celldlpc.update({'u8CId' : 253 }, {'u16CellTransPwr' : 257});
    celldlpc.update({'u8CId' : 254 }, {'u16CellTransPwr' : 257});

    if 1 < len(self.mng.group.enbList):
      NrbEnb = self.case.GetNrbEnb(aotmEnb = self);
      nbrcell = self.dbm.getTable('T_CEL_NBRCEL');
      nbrcell.update({'u8SvrCID' : 252 }, {'u32NbreNBId' : NrbEnb.enbId, 'u16PhyCellId' : NrbEnb.phyCellId, 'u8NbrCID' : 252});
      nbrcell.update({'u8CId' : 253 }, {'u16PhyCellId' : self.phyCellId1});
      nbrcell.update({'u8CId' : 254 }, {'u16PhyCellId' : self.phyCellId2});

    return True;

  def Clear(self):
    print self.__class__.__name__, "clear"

    self.__stopMonitor = True;
    try:
      #self.s.stop()
      self.ei.shutdown();
    except :
      traceback.print_exc(file=sys.stdout);

    try :
      self.xtrace.shutdown();
    except:
      traceback.print_exc(file=sys.stdout);

    try :
      hexIpInt = int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0]));
      hexIpGw = (hexIpInt & 0xffffff00) | 0xfe;
      hexIp = '%x' %hexIpInt;
      hexIpGw = '%x' %hexIpGw;
      ipv4 = self.dbm.getTable('T_IPV4');
      ipv4.overwrite({}, {'u8VlanIndex' : 0, 'au8IPAddr' : hexIp, 'au8NetMask' : 'ffffff00', 'au8GWAddr' : hexIpGw});

      hexIp = '%x' %int(socket.ntohl(struct.unpack('I',self.testMng.epcip)[0]));
      sctp = self.dbm.getTable('T_SCTP');
      sctp.update({}, {'au8DstIP1' : hexIp});

      omc = self.dbm.getTable('T_OMC');
      omc.update({'u8OmcID' : 1}, {'u8eNBIPID' : 1, 'au8OmcServerIP' : hexIp, 'u16SrcPort' : 4999, 'u16DstPort' : 4999});

      enbpara = self.dbm.getTable('T_ENB_PARA');
      enbpara.overwrite({}, {'u32eNBId' : int(self.mng.enbId), 'au8eNBName' : self.mng.enbName});

      cellpara = self.dbm.getTable('T_CEL_PARA');
      cellpara.update({'u8CId' : 252 }, {'u16PhyCellId' : self.mng.phyCellId, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
      cellpara.update({'u8CId' : 253 }, {'u16PhyCellId' : self.mng.phyCellId1, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
      cellpara.update({'u8CId' : 254 }, {'u16PhyCellId' : self.mng.phyCellId2, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});

      syspara = self.dbm.getTable('T_SYS_PARA');
      syspara.update({'u8Indx' : 0 }, {'u8ServeMod' : 1});

      celldlpc = self.dbm.getTable('T_CEL_DLPC');
      celldlpc.update({'u8CId' : 252 }, {'u16CellTransPwr' : 257});
      celldlpc.update({'u8CId' : 253 }, {'u16CellTransPwr' : 257});
      celldlpc.update({'u8CId' : 254 }, {'u16CellTransPwr' : 257});
    except :
      traceback.print_exc(file=sys.stdout)