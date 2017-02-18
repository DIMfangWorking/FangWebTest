# -*- coding: utf-8 -*- 
__all__ = ['EIBasicParse']

import os;
import sys;
import time;

import json;
import copy;

import threading;
import types;

import xmltodict;

import ctypes;
import socket;
import struct;
import select;

import redis;

import multiprocessing.dummy as multiprocessing;
# import multiprocessing;

from logger import getLogger;
logger = getLogger();

from InformationCollection import  *;

class  T_EICellGeneralCfg(object):
  def __init__(self):
    self.u32EnbId = 0;
    self.u32CellCenterFreq = 0;
    self.u16CellPCI = 0;
    self.u8CellBandWidth = 0;
    self.u8CellULDLConfig = 0;
    self.u8CellSpecSubFramCfg = 0;
    self.u8CellULAntNum = 0;
    self.u8CellDLAntNum = 0;
    # delete from 3140
    # self.u8Rcv = 0;

    # add from 3140
    self.au8CpEnable = [0, 0, 0];
    self.au8CpPort = [0, 0, 0];
    self.au8Rcv = [0, 0, 0];

    # 不进入文件
    self.u8CellID = 0;

  def setAttrib(self, id, msg):
    pass;

  def getFlow(self):
    # delete from 3140
    # flow = struct.pack("2IH6B", self.u32EnbId, self.u32CellCenterFreq
    #   , self.u16CellPCI, self.u8CellBandWidth, self.u8CellULDLConfig, self.u8CellSpecSubFramCfg
    #   , self.u8CellULAntNum, self.u8CellDLAntNum, self.u8Rcv);

    # add from 3140
    flow = struct.pack("2IH14B", self.u32EnbId, self.u32CellCenterFreq
      , self.u16CellPCI, self.u8CellBandWidth, self.u8CellULDLConfig, self.u8CellSpecSubFramCfg
      , self.u8CellULAntNum, self.u8CellDLAntNum, self.au8CpEnable[0], self.au8CpEnable[1]
      , self.au8CpEnable[2], self.au8CpPort[0], self.au8CpPort[1], self.au8CpPort[2]
      , self.au8Rcv[0], self.au8Rcv[1], self.au8Rcv[2]);

    # print sys._getframe().f_code.co_name, len(flow)
    return flow;

class T_EICellGeneralState(object):
  def __init__(self):
    self.u16SFN = 0;
    self.u16ActiveUENum = 0;

    # delete from 3140
    # self.s16NI = 0;

    # add from 3140
    self.s16NI = [0, 0, 0];

    self.u8TXPower = 0;
    self.u8Rcv = 0;

  def setAttrib(self, id, msg):
    if id[0] == EIBasicParse.EV_EI_RTL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_CELL_UL:
        self.u16ActiveUENum = msg['u16CellULActUeNum'];
        if isinstance(msg['s16NI'], int):
          self.s16NI[0] = msg['s16NI'];
        else:
          self.s16NI = msg['s16NI'];
    elif id[0] == EIBasicParse.EV_EI_RTL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_CELL_DL:
        self.u16ActiveUENum = msg['u16CellDLActUeNum'];
        self.u8TXPower = msg['u8CellDLTxPwr'];

  def setSFN(self, sfn):
    self.u16SFN = ((sfn/16)%1024);

  def getFlow(self):
    # delete from 3140
    # flow = struct.pack("2Hh2B", self.u16SFN, self.u16ActiveUENum
    #   , self.s16NI, self.u8TXPower, self.u8Rcv);

    # add from 3140
    flow = struct.pack("2H3h2B", self.u16SFN, self.u16ActiveUENum
      , self.s16NI[0], self.s16NI[1], self.s16NI[2], self.u8TXPower, self.u8Rcv);
    
    #print sys._getframe().f_code.co_name, len(flow)
    return flow;

class T_EICellULDetailState(object):
  def __init__(self):
    self.u32ULMacThrput = 0;
    self.u32ULPdcpThrput = 0;
    self.u8ULRbRatio = 0;
    self.u8ULAvrgShdUEForTTI = 0;
    self.u8ULAvrgHarqCnt = 0;
    self.u8ULAvrgBler = 0;
    self.u16ULHarqFailRatio = 0;
    self.u16ULHarqExpireRatio = 0;
    self.u16ULAvrgMcs = 0;
    self.u16ULMaxSchdMcs = 0;
    self.u16ULHqRetSuccRatio1 = 0;
    self.u16ULHqRetSuccRatio2 = 0;
    self.u16ULHqRetSuccRatio3 = 0;
    self.u16ULHqRetSuccRatio4 = 0;

    # delete from 3140
    # new  Int16[100];
    # self.s16NiRB = [];

    # add from 3140
    # new  Int16[100];
    self.s16NiRB0 = [];
    # new  Int16[100];
    self.s16NiRB1 = [];
    # new  Int16[100];
    self.s16NiRB2 = [];

  def setAttrib(self, id, msg):
    if id[0] == EIBasicParse.EV_EI_NRL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_NRL2_CELL: 
        self.u32ULPdcpThrput = msg['u32CellULPdcpThrput'];
    elif id[0] == EIBasicParse.EV_EI_RTL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_CELL_UL:
        self.u32ULMacThrput = msg['u32CellULThroughput'];
        self.u16ULHarqFailRatio = msg['u16CellULHarqFailRatio'];
        self.u16ULHarqExpireRatio = msg['u16CellULHarqSelfMaintainRatio'];
        self.u16ULAvrgMcs = msg['u16CellULMcs'];
        self.u8ULRbRatio = msg['u8CellULRbUsedRatio'];
        self.u8ULAvrgShdUEForTTI = msg['u8CellULSchdUeNumPerTti'];
        self.u8ULAvrgHarqCnt = msg['u8CellULAvrHarqTxCnt'];
        self.u8ULAvrgBler = msg['u8CellULBler'];
        self.u16ULMaxSchdMcs = msg['u16CellULMaxSchdMcs'];
        self.u16ULHqRetSuccRatio1 = msg['u16CellULHqRetSuccRatio1'];
        self.u16ULHqRetSuccRatio2 = msg['u16CellULHqRetSuccRatio2'];
        self.u16ULHqRetSuccRatio3 = msg['u16CellULHqRetSuccRatio3'];
        self.u16ULHqRetSuccRatio4 = msg['u16CellULHqRetSuccRatio4'];

        # delete from 3140
        # self.s16NiRB = msg['s16NiRB'];

        # add from 3140
        if 's16NiRB' in msg:
          self.s16NiRB0 = msg['s16NiRB'];
          self.s16NiRB1 = [0] * 100;
          self.s16NiRB2 = [0] * 100;
        else :
          if 's16NiRB0' in msg:
            self.s16NiRB0 = msg['s16NiRB0'];
          if 's16NiRB1' in msg:
            self.s16NiRB1 = msg['s16NiRB1'];
          if 's16NiRB2' in msg:
            self.s16NiRB2 = msg['s16NiRB2'];

  def getFlow(self):
    flow = struct.pack("2I4B8H", self.u32ULMacThrput, self.u32ULPdcpThrput
      , self.u8ULRbRatio, self.u8ULAvrgShdUEForTTI, self.u8ULAvrgHarqCnt
      , self.u8ULAvrgBler, self.u16ULHarqFailRatio, self.u16ULHarqExpireRatio
      , self.u16ULAvrgMcs, self.u16ULMaxSchdMcs, self.u16ULHqRetSuccRatio1
      , self.u16ULHqRetSuccRatio2, self.u16ULHqRetSuccRatio3, self.u16ULHqRetSuccRatio4);

    # delete from 3140
    # if len(self.s16NiRB) != 100:
    #   return None;

    # for item in self.s16NiRB:
    #   flow += struct.pack("h", item);

    # add from 3140
    if len(self.s16NiRB0) != 100:
      return None;
    if len(self.s16NiRB1) != 100:
      return None;
    if len(self.s16NiRB2) != 100:
      return None;

    for item in self.s16NiRB0:
      flow += struct.pack("h", item);

    for item in self.s16NiRB1:
      flow += struct.pack("h", item);

    for item in self.s16NiRB2:
      flow += struct.pack("h", item);

    # print sys._getframe().f_code.co_name, len(flow)
    return flow;

class T_EICellDLDetailState(object):
  def __init__(self):
    self.u32DLMacThrput = 0;
    self.u32DLPdcpThrput = 0;
    self.u8DLRbRatio = 0;
    self.u8DLAvrgShdUEForTTI = 0;
    self.u8DLAvrgHarqCnt = 0;
    self.u8DLAvrgBler = 0;
    self.u16DLHarqFailRatio = 0;
    self.u16DLHarqExpireRatio = 0;
    self.u16DLAvrgMcs = 0;
    self.u16DtxRatio = 0;
    self.u8TXDivTMRatio = 0;
    self.u8TxCddRatio = 0;
    self.u16DLMaxSchdMcs = 0;
    self.u16DLHqRetSuccRatio1 = 0;
    self.u16DLHqRetSuccRatio2 = 0;
    self.u16DLHqRetSuccRatio3 = 0;
    self.u16DLHqRetSuccRatio4 = 0;

  def setAttrib(self, id, msg):
    if id[0] == EIBasicParse.EV_EI_NRL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_NRL2_CELL: 
        self.u32DLPdcpThrput = msg['u32CellDLPdcpThrput'];
    elif id[0] == EIBasicParse.EV_EI_RTL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_CELL_DL:
        self.u32DLMacThrput = msg['u32CellDLThroughput'];
        self.u16DLHarqFailRatio = msg['u16CellDLHarqFailRatio'];
        self.u16DLHarqExpireRatio = msg['u16CellDLHarqSelfMaintainRatio'];
        self.u16DtxRatio = msg['u16CellDLDtxRatio'];
        self.u16DLAvrgMcs = msg['u16CellDLMcs'];
        self.u8DLRbRatio = msg['u8CellDLRbUsedRatio'];
        self.u8DLAvrgShdUEForTTI = msg['u8CellDLSchdUeNumPerTti'];
        self.u8DLAvrgHarqCnt = msg['u8CellDLAvrHarqTxCnt'];
        self.u8DLAvrgBler = msg['u8CellDLBler'];
        self.u8TXDivTMRatio = msg['u8CellDLTxDivRatio'];
        self.u8TxCddRatio = msg['u8CellDLTxCddRatio'];
        self.u16DLMaxSchdMcs = msg['u16CellDLMaxSchdMcs'];
        self.u16DLHqRetSuccRatio1 = msg['u16CellDLHqRetSuccRatio1'];
        self.u16DLHqRetSuccRatio2 = msg['u16CellDLHqRetSuccRatio2'];
        self.u16DLHqRetSuccRatio3 = msg['u16CellDLHqRetSuccRatio3'];
        self.u16DLHqRetSuccRatio4 = msg['u16CellDLHqRetSuccRatio4'];

  def getFlow(self):
    flow = struct.pack("2I4B4H2B5H", self.u32DLMacThrput, self.u32DLPdcpThrput
      , self.u8DLRbRatio, self.u8DLAvrgShdUEForTTI, self.u8DLAvrgHarqCnt, self.u8DLAvrgBler
      , self.u16DLHarqFailRatio, self.u16DLHarqExpireRatio, self.u16DLAvrgMcs
      , self.u16DtxRatio, self.u8TXDivTMRatio, self.u8TxCddRatio, self.u16DLMaxSchdMcs
      , self.u16DLHqRetSuccRatio1, self.u16DLHqRetSuccRatio2, self.u16DLHqRetSuccRatio3
      , self.u16DLHqRetSuccRatio4);
    # print sys._getframe().f_code.co_name, len(flow)

    return flow;

class T_EIUEGeneralInfo(object):
  def __init__(self):
    self.u32UEGid = 0;

    # 不需要从基本信息中获取
    self.u8UELiveCount = 0;
    # 不需要从基本信息中获取
    self.u8IsUsed = 1;
    self.u8PL = 0;
    self.u8TxDivRatio = 0;
    self.u32ULPdcpThrput = 0;
    self.u32DLPdcpThrput = 0;
    self.u32IP = 0;
    self.u32ULMacThrput = 0;
    self.u32DLMacThrput = 0;
    self.u16ULSchdCnt = 0;
    self.u16DLSchdCnt = 0;
    self.u16ULHarqFailRatio = 0;
    self.u16DLHarqFailRatio = 0;
    self.u16ULHarqExpireRatio = 0;
    self.u16DLHarqExpireRatio = 0;
    self.u16ULAvrgMcs = 0;
    self.u16DLAvrgMcs = 0;
    self.u8ULAvrgHarqTxCnt = 0;
    self.u8DLAvrgHarqTxCnt = 0;
    self.u16ULAvrgRbNum = 0;
    self.u16DLAvrgRbNum = 0;
    self.u8ULAvrgBler = 0;
    self.u8DLAvrgBler = 0;
    self.u16DtxRatio = 0;

    # add from 3140
    self.u8ActCpSet = 0;
    self.u8MCpIdx = 0;

    # /* SDMA相关 */
    self.u16LastSdmaUeIdx = 0; #/* 最近一次配对UEIdx */
    self.u16TotlSdmaCnt = 0;  #/* UE级SDMA总次数 */
    self.s16Sinr = [0, 0, 0]; #/* UE级不同CP的SINR */

    # /* MuMimo相关 */
    self.u16LastMuUeIdx = 0; # /* 最近一次配对UEIdx */
    self.u16TotlMuCnt = 0;  # /* UE级MU总次数 */
    self.u32CalAvgD = 0;  # /* 最近一次配对UE的正交性因子(MU) */

    # /* 上下行CCE分配失败统计 */
    self.u16UlCceAllocFailCnt = 0; #/* UE级上行CCE分配失败次数 */
    self.u16DlCceAllocFailCnt = 0; #/* UE级下行CCE分配失败次数 */  

    self.lastUpdataTime = time.time();

  def __delete__(self):
    print 'delete ue', self.u32UEGid

  def setAttrib(self, id, msg):
    self.u32UEGid = id[-1];
    self.lastUpdataTime = time.time();

    if id[0] == EIBasicParse.EV_EI_RTL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_UE_UL:
        self.u8PL = msg['u8UEULPL'];
        self.u32ULMacThrput = msg['u32UEULThroughput'];
        self.u16ULSchdCnt = msg['u16UEULSchdCnt'];
        self.u16ULHarqFailRatio = msg['u16UEULHarqFailRatio'];
        self.u16ULHarqExpireRatio = msg['u16UEULHarqSelfMaintainRatio'];
        self.u16ULAvrgMcs = msg['u16UEULMcs'];
        self.u16ULAvrgRbNum = msg['u16UEULAvrRbNum'];
        self.u8ULAvrgHarqTxCnt = msg['u8UEULAvrHarqTxCnt'];
        self.u8ULAvrgBler = msg['u8UEULBler'];

        # add from 3140
        if 'u8ActCpSet' in msg :
          self.u8ActCpSet = msg['u8ActCpSet'];
        if 'u8MCpIdx' in msg:
          self.u8MCpIdx = msg['u8MCpIdx'];

        # /* SDMA相关 */
        if 'u16LastSdmaUeIdx' in msg:
          self.u16LastSdmaUeIdx = msg['u16LastSdmaUeIdx']; #/* 最近一次配对UEIdx */
        if 'u16TotlSdmaCnt' in msg:
          self.u16TotlSdmaCnt = msg['u16TotlSdmaCnt'];  #/* UE级SDMA总次数 */
        if 's16Sinr' in msg:
          self.s16Sinr = msg['s16Sinr']; #/* UE级不同CP的SINR */

        # /* MuMimo相关 */
        if 'u16LastMuUeIdx' in msg:
          self.u16LastMuUeIdx = msg['u16LastMuUeIdx']; #/* 最近一次配对UEIdx */
        if 'u16TotlMuCnt' in msg:
          self.u16TotlMuCnt = msg['u16TotlMuCnt'];  #/* UE级MU总次数 */
        if 'u32CalAvgD' in msg:
          self.u32CalAvgD = msg['u32CalAvgD'];  #/* 最近一次配对UE的正交性因子(MU) */

        # /* 上下行CCE分配失败统计 */
        if 'u16UlCceAllocFailCnt' in msg:
          self.u16UlCceAllocFailCnt = msg['u16UlCceAllocFailCnt']; #/* UE级上行CCE分配失败次数 */
        if 'u16DlCceAllocFailCnt' in msg:
          self.u16DlCceAllocFailCnt = msg['u16DlCceAllocFailCnt']; #/* UE级下行CCE分配失败次数 */
      elif id[1] == EIBasicParse.EI_GENERAL_TAG_ID_RTL2_UE_DL:
        self.u32DLMacThrput = msg['u32UEDLThroughput'];
        self.u16DLSchdCnt = msg['u16UEDLSchdCnt'];
        self.u16DLHarqFailRatio = msg['u16UEDLHarqFailRatio'];
        self.u16DLHarqExpireRatio = msg['u16UEDLHarqSelfMaintainRatio'];
        self.u16DtxRatio = msg['u16UEDLDtxRatio'];
        self.u16DLAvrgMcs = msg['u16UEDLMcs'];
        self.u16DLAvrgRbNum = msg['u16UEDLAvrRbNum'];
        self.u8DLAvrgHarqTxCnt = msg['u8UEDLAvrHarqTxCnt'];
        self.u8DLAvrgBler = msg['u8UEDLBler'];
        self.u8TxDivRatio = msg['u8UEDLTxDivRatio'];
    elif id[0] == EIBasicParse.EV_EI_NRL2_GENERAL_REPORT_MSG:
      if id[1] == EIBasicParse.EI_GENERAL_TAG_ID_NRL2_UE:
        self.u32ULPdcpThrput = msg['u32UEULPdcpThrput'];
        self.u32DLPdcpThrput = msg['u32UEDLPdcpThrput'];
        self.u32IP = msg['u32IP'];

  def getFlow(self):
    # add from 3140
    flow = struct.pack("I4B5I8H2B2H2BH2B2H3h2HI2H", self.u32UEGid, self.u8UELiveCount, self.u8IsUsed, self.u8PL
      , self.u8TxDivRatio, self.u32ULPdcpThrput, self.u32DLPdcpThrput, self.u32IP
      , self.u32ULMacThrput, self.u32DLMacThrput, self.u16ULSchdCnt, self.u16DLSchdCnt
      , self.u16ULHarqFailRatio, self.u16DLHarqFailRatio, self.u16ULHarqExpireRatio
      , self.u16DLHarqExpireRatio, self.u16ULAvrgMcs, self.u16DLAvrgMcs
      , self.u8ULAvrgHarqTxCnt, self.u8DLAvrgHarqTxCnt, self.u16ULAvrgRbNum
      , self.u16DLAvrgRbNum, self.u8ULAvrgBler, self.u8DLAvrgBler, self.u16DtxRatio, self.u8ActCpSet
      , self.u8MCpIdx, self.u16LastSdmaUeIdx, self.u16TotlSdmaCnt, self.s16Sinr[0], self.s16Sinr[1]
      , self.s16Sinr[1], self.u16LastMuUeIdx, self.u16TotlMuCnt, self.u32CalAvgD, self.u16UlCceAllocFailCnt
      , self.u16DlCceAllocFailCnt);
    # print sys._getframe().f_code.co_name, len(flow)
    return flow;

class T_EIUEGeneralList(object):
  def __init__(self):
    '''
    UInt32 u32UENum;
    atEIUEGeneralInfo = new T_EIUEGeneralInfo[ConstValue.MAX_UE_NUM]; //max 3600
    '''
    self.u32UENum = 0;
    self.ueDict = {};
    pass;

  def __del__(self):
    self.ueDict.clear();
    del self.ueDict;

  def setAttrib(self, id, msg):
    logger.debug("T_EIUEGeneralList setAttrib %r ", id);
    if id[-1] in self.ueDict:
      ue = self.ueDict[id[-1]];
    else:
      self.u32UENum += 1;
      self.ueDict[id[-1]] = T_EIUEGeneralInfo();
      ue = self.ueDict[id[-1]];
    ue.setAttrib(id, msg);

  def getFlow(self):
    flow = struct.pack("I", self.u32UENum);

    keys = sorted(self.ueDict.keys());
    for k in keys:
      flow += self.ueDict[k].getFlow();

    # print sys._getframe().f_code.co_name, len(flow)
    return flow;

  def clearUe(self):
    keys = self.ueDict.keys();
    currentTime = time.time();
    for k in keys:
      if currentTime - self.ueDict[k].lastUpdataTime > 3:
        self.u32UENum -= 1;
        self.ueDict.pop(k);

class T_EIGeneralCellInfo(object):
  def __init__(self):
    self.u8CellID = 0;
    self.u8OpticPort = 0;

    # add from 3140
    self.u8IsSuperCell = 0;

    self.u16CellLiveCount = 0;
    self.cellGeneralCfg = T_EICellGeneralCfg();
    self.cellGeneralState = T_EICellGeneralState();
    self.cellULDetailState = T_EICellULDetailState();
    self.cellDLDetailState = T_EICellDLDetailState();
    self.ueGeneralList = T_EIUEGeneralList();

    self.lastUpdataTime = time.time();

  def __del__(self):
    logger.info('T_EIGeneralCellInfo delete cell %r', self.u8CellID);
    del self.cellGeneralCfg
    del self.cellGeneralState
    del self.cellULDetailState
    del self.cellDLDetailState
    del self.ueGeneralList

  def __getattribute__(self, name):
    self.lastUpdataTime = time.time(); 
    return object.__getattribute__(self, name);

  def setAttrib(self, id, msg):
    self.lastUpdataTime = time.time(); 

    self.u8CellID = id[-1];
    if 'u8OpticPort' in msg:
      self.u8OpticPort = msg['u8OpticPort'];

    # add from 3140
    if 'u8IsSuperCell' in msg:
      self.u8IsSuperCell = msg['u8IsSuperCell'];

    self.u16CellLiveCount = 0;
    self.cellGeneralCfg.u32EnbId = msg['u32EnbId'];
    self.cellGeneralCfg.u32CellCenterFreq = msg['u32CellCenterFreq'];
    self.cellGeneralCfg.u16CellPCI = msg['u16CellPCI'];
    self.cellGeneralCfg.u8CellBandWidth = msg['u8CellBandWidth'];
    self.cellGeneralCfg.u8CellULDLConfig = msg['u8CellULDLConfig'];
    self.cellGeneralCfg.u8CellSpecSubFramCfg = msg['u8CellSpecSubFramCfg'];
    self.cellGeneralCfg.u8CellULAntNum = msg['u8CellULAntNum'];
    self.cellGeneralCfg.u8CellDLAntNum = msg['u8CellDLAntNum'];
    self.cellGeneralCfg.u8CellID = id[-1];

    # add from 3140
    if 'au8CpEnable' in msg:
      self.cellGeneralCfg.au8CpEnable = msg['au8CpEnable'];

    if 'au8CpPort' in msg:
      self.cellGeneralCfg.au8CpPort = msg['au8CpPort'];

  def getFlow(self):
    flow = struct.pack("4B2H", self.u8CellID, self.u8OpticPort, self.u8IsSuperCell, 0, self.u16CellLiveCount, 0);
    flow += self.cellGeneralCfg.getFlow();
    flow += self.cellGeneralState.getFlow();
    flowCellUl = self.cellULDetailState.getFlow();
    if not flowCellUl:
      # print "T_EIGeneralCellInfo flowCellUl none"
      return None;
    else:
      flow += flowCellUl;

    flowCellDl = self.cellDLDetailState.getFlow();
    if not flowCellDl:
      # print "T_EIGeneralCellInfo flowCellDl none"
      return None;
    else:
      flow += flowCellDl;
    flow += self.ueGeneralList.getFlow();

    return flow;

def parseMsg(obj, queue, logger):
  logger.info('process start');
  while True:
    argv = queue.get();
    logger.debug('process queue process start');
    msgId = argv[0];
    data = argv[1];
    obj.threadParseMsg(msgId, data);
    logger.debug('process queue process end');

class EIBasicParse(object):

  # EI基本信息上报消息
  EV_EI_NRL2_GENERAL_REPORT_MSG = 1;
  EV_EI_RTL2_GENERAL_REPORT_MSG = 301;
  EV_EI_L3_GENERAL_REPORT_MSG = 502;

  # EI基本信息上报TAG ID
  EI_GENERAL_TAG_ID_NRL2_CELL = 1;
  EI_GENERAL_TAG_ID_NRL2_UE = 2;
  
  EI_GENERAL_TAG_ID_RTL2_CELL_UL = 1;
  EI_GENERAL_TAG_ID_RTL2_CELL_DL = 2;
  EI_GENERAL_TAG_ID_RTL2_UE_UL = 3;
  EI_GENERAL_TAG_ID_RTL2_UE_DL = 4;
  
  EI_GENERAL_TAG_ID_L3 = 1;

  def __init__(self):
    self.cellDict = {};
    self.queue = multiprocessing.Queue();
    logger.info('start process for parse Msg')
    self.process = multiprocessing.Process(target=parseMsg, args= (self, self.queue, logger));
    self.process.start();

  def _fillStruct(self, id, msg):
    msgId = id[0];
    # sfn is airtime covert
    sfn = id[1];

    if msgId == self.EV_EI_NRL2_GENERAL_REPORT_MSG:
      for item in msg['message']:
        tlvId = item['tlv_id'];
        xxId = item['id']
        cellId = item['cellId'];
        if tlvId == self.EI_GENERAL_TAG_ID_NRL2_CELL:
          self.getCell(xxId).cellGeneralState.setSFN(sfn);
          self.getCell(xxId).cellGeneralState.setAttrib((msgId, tlvId, xxId), item['value']);
          self.getCell(xxId).cellULDetailState.setAttrib((msgId, tlvId, xxId), item['value']);
          self.getCell(xxId).cellDLDetailState.setAttrib((msgId, tlvId, xxId), item['value']);
        elif tlvId == self.EI_GENERAL_TAG_ID_NRL2_UE:
          self.getCell(cellId).cellGeneralState.setSFN(sfn);
          self.getCell(cellId).ueGeneralList.setAttrib((msgId, tlvId, cellId, xxId), item['value']);
    elif msgId == self.EV_EI_RTL2_GENERAL_REPORT_MSG:
      for item in msg['message']:
        tlvId = item['tlv_id'];
        xxid = item['id'];
        cellId = item['cellId'];
        if tlvId == self.EI_GENERAL_TAG_ID_RTL2_CELL_UL:
          self.getCell(cellId).cellGeneralState.setSFN(sfn);
          self.getCell(cellId).cellGeneralState.setAttrib((msgId, tlvId, cellId), item['value']);
          self.getCell(cellId).cellULDetailState.setAttrib((msgId, tlvId, cellId), item['value']);
        elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_CELL_DL:
          self.getCell(cellId).cellGeneralState.setSFN(sfn);
          self.getCell(cellId).cellGeneralState.setAttrib((msgId, tlvId, cellId), item['value']);
          self.getCell(cellId).cellDLDetailState.setAttrib((msgId, tlvId, cellId), item['value']);
        elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_UE_UL:
          self.getCell(cellId).cellGeneralState.setSFN(sfn);
          self.getCell(cellId).ueGeneralList.setAttrib((msgId, tlvId, cellId, xxid), item['value']);
        elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_UE_DL:
          self.getCell(cellId).cellGeneralState.setSFN(sfn);
          self.getCell(cellId).ueGeneralList.setAttrib((msgId, tlvId, cellId, xxid), item['value']);
    elif msgId == self.EV_EI_L3_GENERAL_REPORT_MSG:
      for item in msg['message']:
        tlvId = item['tlv_id'];
        cellId = item['id'];
        if item['tlv_id'] == self.EI_GENERAL_TAG_ID_L3:
          self.getCell(cellId).setAttrib((msgId, tlvId, cellId) , item['value']);

    currentTime = time.time();
    for cell in self.cellDict.keys():
      if currentTime - self.cellDict[cell].lastUpdataTime > 3:
        self.cellDict.pop(cell);
      else :
        self.cellDict[cell].ueGeneralList.clearUe();

  def _nrl2Process(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;
    if tlvId == self.EI_GENERAL_TAG_ID_NRL2_CELL:
      (ulthr, dlthr) = struct.unpack("!II", data[:tlvlength]);
      result = {'u32CellULPdcpThrput':ulthr, 'u32CellDLPdcpThrput' : dlthr};
    elif tlvId == self.EI_GENERAL_TAG_ID_NRL2_UE:
      (ulthr, dlthr, ip) = struct.unpack("!III", data[:tlvlength]);
      result = {'u32UEULPdcpThrput' : ulthr, 'u32UEDLPdcpThrput' : dlthr, 'u32IP' : ip};
    else:
      raise Exception("nrl2 msg not support %d" %tlvId);

    return {'tlv_id':tlvId, 'id': id, 'cellId' : cellId, 'value' : result};

  def _rtl2CellUlProcess(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;

    before3140Size = struct.calcsize("!I3HhH4B5H100h");
    after3140Size = struct.calcsize("!I3H3hH4B5H300h");

    (ulthr, actue, failratio, maintainratio) = struct.unpack("!I3H", data[:struct.calcsize("!I3H")]);
    result = {'u32CellULThroughput' : ulthr};
    result['u16CellULActUeNum'] = actue;
    result['u16CellULHarqFailRatio'] = failratio;
    result['u16CellULHarqSelfMaintainRatio'] = maintainratio;

    if before3140Size == tlvlength:
      (ni, ulmcs, usedratio, uenumpertti, txcnt, bler, schdmcs, ratio1, ratio2, ratio3, ratio4) = \
        struct.unpack("!hH4B5H", data[struct.calcsize("!I3H"):struct.calcsize("!I3HhH4B5H")]);

      nirb = [];

      for i in range(100):
        (nirbItem,) = struct.unpack("!h", data[tlvlength - 200 + i*2 : tlvlength - 200 + (i + 1)*2]);
        nirb.append(nirbItem);

      result['s16NI'] = ni;

      result['s16NiRB'] = nirb;
    elif after3140Size == tlvlength:
      # add from 3140
      (ni0, ni1, ni2, ulmcs, usedratio, uenumpertti, txcnt, bler, schdmcs, ratio1, ratio2, ratio3, ratio4) = \
        struct.unpack("!3hH4B5H", data[struct.calcsize("!I3H"):struct.calcsize("!I3H3hH4B5H")]);

      for i in range(3):
        nirb = [];
        for j in range(100):
          (nirbItem,) = struct.unpack("!h", data[tlvlength - (3 - i) * 200 + j*2 : tlvlength - (3 - i) * 200 + (j + 1)*2]);
          nirb.append(nirbItem);
        result['s16NiRB' + str(i)] = nirb;

      result['s16NI'] = [ni0, ni1, ni2];
    else:
      raise Exception("rtl2 msg EI_GENERAL_TAG_ID_RTL2_CELL_UL tlv not support length " %tlvlength);

    result['u16CellULMcs'] = ulmcs;
    result['u8CellULRbUsedRatio'] = usedratio;
    result['u8CellULSchdUeNumPerTti'] = uenumpertti;
    result['u8CellULAvrHarqTxCnt'] = txcnt;
    result['u8CellULBler'] = bler;
    result['u16CellULMaxSchdMcs'] = schdmcs;
    result['u16CellULHqRetSuccRatio1'] = ratio1;
    result['u16CellULHqRetSuccRatio2'] = ratio2;
    result['u16CellULHqRetSuccRatio3'] = ratio3;
    result['u16CellULHqRetSuccRatio4'] = ratio4;

    return result;

  def _rtl2CellDlProcess(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;

    (dlthr, actue, failratio, maintainratio, txratio, dlmcs, txpwr, usedratio, 
      uenumpertti, txcnt, bler, divratio, cddratio, rcved, schdmcs, ratio1, ratio2, ratio3, ratio4) = struct.unpack("!IHHHHHBBBBBBBBHHHHH", data[:tlvlength]);
    result = {'u32CellDLThroughput' : dlthr};
    result['u16CellDLActUeNum'] = actue;
    result['u16CellDLHarqFailRatio'] = failratio;
    result['u16CellDLHarqSelfMaintainRatio'] = maintainratio;
    result['u16CellDLDtxRatio'] = txratio;
    result['u16CellDLMcs'] = dlmcs;
    result['u8CellDLTxPwr'] = txpwr;
    result['u8CellDLRbUsedRatio'] = usedratio;
    result['u8CellDLSchdUeNumPerTti'] = uenumpertti;
    result['u8CellDLAvrHarqTxCnt'] = txcnt;
    result['u8CellDLBler'] = bler;
    result['u8CellDLTxDivRatio'] = divratio;
    result['u8CellDLTxCddRatio'] = cddratio;
    result['u8CellDLRcved'] = rcved;
    result['u16CellDLMaxSchdMcs'] = schdmcs;
    result['u16CellDLHqRetSuccRatio1'] = ratio1;
    result['u16CellDLHqRetSuccRatio2'] = ratio2;
    result['u16CellDLHqRetSuccRatio3'] = ratio3;
    result['u16CellDLHqRetSuccRatio4'] = ratio4;

    return result;

  def _rtl2UEUl(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;

    before3140Size = struct.calcsize("!I5H6B");
    after3140Size = struct.calcsize("!I5H8B2Hh2HI2H");

    (ulthr, schcnt, failratio, maintainratio, ulmcs, avrrbnum, txcnt, bler, ulpl) \
        = struct.unpack("!I5H3B", data[:before3140Size - 3]);
    result = {'u32UEULThroughput' : ulthr};
    result['u16UEULSchdCnt'] = schcnt;
    result['u16UEULHarqFailRatio'] = failratio;
    result['u16UEULHarqSelfMaintainRatio'] = maintainratio;
    result['u16UEULMcs'] = ulmcs;
    result['u16UEULAvrRbNum'] = avrrbnum;
    result['u8UEULAvrHarqTxCnt'] = txcnt;
    result['u8UEULBler'] = bler;
    result['u8UEULPL'] = ulpl;

    if before3140Size == tlvlength:
      (recd1, recd2, recd3) = struct.unpack("!3B", data[before3140Size - 3 : before3140Size]);
      result['u8Rsv'] = [recd1, recd2, recd3];
    elif after3140Size == tlvlength:
      # add from 3140
      (actCpSet, mCpIdx, recd1, recd2, recd3, sdmaUeIndex, sdmacnt, sinr,
        lastMuUeIdx, totlMuCnt, calAvgD, ulCceAllocFailCnt, dlCceAllocFailCnt) = \
        struct.unpack("!5B2Hh2HI2H", data[before3140Size - 3 : after3140Size]);

      result['u8ActCpSet'] = actCpSet; #/* 激活CP集bitmap,上报时刻采样即可 */
      result['u8MCpIdx'] = mCpIdx; #/* UE的主CP索引 */
      result['u8Rsv'] = [recd1, recd2, recd3];

      # /* SDMA相关 */
      result['u16LastSdmaUeIdx'] = sdmaUeIndex; #/* 最近一次配对UEIdx */
      result['u16TotlSdmaCnt'] = sdmacnt;  #/* UE级SDMA总次数 */
      result['s16Sinr'] = sinr; #/* UE级不同CP的SINR */

      # /* MuMimo相关 */
      result['u16LastMuUeIdx'] = lastMuUeIdx; #/* 最近一次配对UEIdx */
      result['u16TotlMuCnt'] = totlMuCnt;  #/* UE级MU总次数 */
      result['u32CalAvgD'] = calAvgD;  #/* 最近一次配对UE的正交性因子(MU) */

      # /* 上下行CCE分配失败统计 */
      result['u16UlCceAllocFailCnt'] = ulCceAllocFailCnt; #/* UE级上行CCE分配失败次数 */  
      result['u16DlCceAllocFailCnt'] = dlCceAllocFailCnt; #/* UE级下行CCE分配失败次数 */  

    return result;

  def _rtl2UEDl(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;
    (dlthr, schcnt, failratio, maintainratio, txratio, dlmcs, avrrbnum, txcnt, bler, divratio, rcv) \
        = struct.unpack("!IHHHHHHBBBB", data[:tlvlength]);
    result = {'u32UEDLThroughput' : dlthr};
    result['u16UEDLSchdCnt'] = schcnt;
    result['u16UEDLHarqFailRatio'] = failratio;
    result['u16UEDLHarqSelfMaintainRatio'] = maintainratio;
    result['u16UEDLDtxRatio'] = txratio;
    result['u16UEDLMcs'] = dlmcs;
    result['u16UEDLAvrRbNum'] = avrrbnum;
    result['u8UEDLAvrHarqTxCnt'] = txcnt;
    result['u8UEDLBler'] = bler;
    result['u8UEDLTxDivRatio'] = divratio;
    result['rcv'] = rcv;

    return result;

  def _rtl2Process(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;

    if tlvId == self.EI_GENERAL_TAG_ID_RTL2_CELL_UL:
      result = self._rtl2CellUlProcess(key, data);
    elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_CELL_DL:
      result = self._rtl2CellDlProcess(key, data);
    elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_UE_UL:
      result = self._rtl2UEUl(key, data);
    elif tlvId == self.EI_GENERAL_TAG_ID_RTL2_UE_DL:
      result = self._rtl2UEDl(key, data);
    else:
      raise Exception("rtl2 msg not support %d" %tlvId);

    return {'tlv_id':tlvId, 'id': id, 'cellId' : cellId, 'value' : result};

  def _l3Process(self, key, data):
    (tlvId, id, tlvlength, cellId) = key;
    if tlvId == self.EI_GENERAL_TAG_ID_L3:
      before3140Size = struct.calcsize("!2IH6B");
      after3140Size = struct.calcsize("!2IH14B");

      (enbid, freq, pci, bandwidth, uldlconfig, subframcfg, ulantnum, dlantnum) = struct.unpack("!2IH5B", data[:before3140Size - 1]);
      result = {'u32EnbId' : enbid};
      result['u32CellCenterFreq'] = freq;
      result['u16CellPCI'] = pci;
      result['u8CellBandWidth'] = bandwidth;
      result['u8CellULDLConfig'] = uldlconfig;
      result['u8CellSpecSubFramCfg'] = subframcfg;
      result['u8CellULAntNum'] = ulantnum;
      result['u8CellDLAntNum'] = dlantnum;

      if before3140Size == tlvlength:
        (opticport,) = struct.unpack("!B", data[before3140Size - 1 :]);
        result['u8OpticPort'] = opticport;
      elif after3140Size == tlvlength:
        #add from 3140
        (u8IsSuperCell, au8CpEnable0, au8CpEnable1, au8CpEnable2, au8CpPort0, au8CpPort1, au8CpPort2, au8Rcv0, au8Rcv1) = \
            struct.unpack("!9B", data[before3140Size - 1 :]);
        result['u8IsSuperCell'] = u8IsSuperCell;
        result['au8CpEnable'] = [au8CpEnable0, au8CpEnable1, au8CpEnable2];
        result['au8CpPort'] = [au8CpPort0, au8CpPort1, au8CpPort2];
        result['au8Rcv'] = [au8Rcv0, au8Rcv1];
      else :
        raise Exception("l3 msg not support length %d" %tlvlength);
    else:
      raise Exception("l3 msg not support %d" %tlvId);
    return {'tlv_id':tlvId, 'id': id, 'cellId' : cellId, 'value' : result};

  def getJson(self):
    return copy.deepcopy(self.cellDict);
    # return json.dumps(self.cellDict, default=lambda obj : obj.__dict__);

  def getFlow(self):
    logger.info('EIBasicParse getFlow start');
    flow = None;
    keys = sorted(self.cellDict.keys());
    cellNum = 0;
    for cell in keys:
      flowReslut = self.cellDict[cell].getFlow();
      if flowReslut:
        flow = (flow + flowReslut) if flow else flowReslut;
        cellNum += 1;

    logger.info('EIBasicParse getFlow end');

    return cellNum, flow;

  def threadParseMsg(self, msgId, data):
    eiMsg = msgId[0];
    num = msgId[3];

    result = {'id' : eiMsg, 'message' : []};

    index = 0;
    tlvEndOffset = 0;

    while index < num:
      startOffset = tlvEndOffset;
      headEndOffset = startOffset + 8;

      (tlvId, id, tlvlength, cellId, rcv) = struct.unpack("!HHHBB", data[startOffset : headEndOffset]);

      tlvEndOffset = headEndOffset + tlvlength;

      if eiMsg == self.EV_EI_NRL2_GENERAL_REPORT_MSG:
        message = self._nrl2Process((tlvId, id, tlvlength, cellId), data[headEndOffset : tlvEndOffset]);
      elif eiMsg == self.EV_EI_RTL2_GENERAL_REPORT_MSG:
        message = self._rtl2Process((tlvId, id, tlvlength, cellId), data[headEndOffset : tlvEndOffset]);
      elif eiMsg == self.EV_EI_L3_GENERAL_REPORT_MSG:
        message = self._l3Process((tlvId, id, tlvlength, cellId), data[headEndOffset : tlvEndOffset]);
      else:
        raise Exception("ei msg not support %d" %eiMsg);

      index += 1;
      result['message'].append(message);

    self._fillStruct(msgId, result);

  def parseMsg(self, msgId, data):
    logger.info('EIBasicParse parseMsg start');
    self.queue.put([msgId, data]);
    logger.info('EIBasicParse parseMsg end');

  def getCell(self, cellId):
    if cellId in self.cellDict:
      cellInfo = self.cellDict[cellId];
    else:
      self.cellDict[cellId] = T_EIGeneralCellInfo();
      cellInfo = self.cellDict[cellId];
    return cellInfo;

  def stop(self):
    logger.info('EIBasicParse stop');
    self.process.terminate();
