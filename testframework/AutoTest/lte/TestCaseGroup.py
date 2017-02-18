#-*- coding:utf-8 -*-
__author__ = 'guowei';
__all__=['TestCaseGroupInterface'];

import os;
import sys;
import traceback;
import socket;

# from EnbManager import EnbManager;
from TestCase import TestCase;

import pdb;

class TestCaseGroup:
  def __init__ (self, testMng, group):
    self.testMng = testMng
    self.groupPath = group.get('name')
    print('group ' + self.groupPath + ' run begin\n\n')
    self.caseList = [];
    self.caseCfg = [];
    self.enbList = {};
    self.ueGrpList = {};
    self.groupLogPath = '';
    self.initGroupLog();
    self.LoadGroupCfg(group);
    self.stepInfoManager = StepInfo(self, len(self.caseCfg));

  def initGroupLog(self):
    self.groupLogPath = self.testMng.TaskLogPath + os.sep + self.groupPath;
    if not os.path.exists(self.groupLogPath):
      os.mkdir(self.groupLogPath);
      print('mkdir ' + self.groupLogPath);

  def LoadGroupCfg(self, group):
    self.GrpName = group.get('name');
    for item in  group:
      if item.tag == 'EnbId':
        tag = item.get('name');
      if None == tag:
        tag = 'src_enb';
        self.enbList[tag] = EnbManager(item, self);
      elif item.tag == 'TestCase' :
        self.caseCfg.append(item);

  def Run (self):
    ret = False
    result = True
    index = 1;
    for enb in self.enbList:
      self.enbList[enb].Run();

    for case in self.caseCfg:
      try:
        test_case = TestCase(self, case);
        self.stepInfoManager.stepTestcase(test_case, index);
        if test_case.Run() == False:
          raise RunFailException(test_case.name +' result : '+str(ret));
        self.caseList.append(test_case);
        result = True;
        index += 1;
      except RunFailException:
        print sys.exc_info();
        print('test case exec fail');
        result = False;
        break;
      except :
        print sys.exc_info();
        traceback.print_exc(file=sys.stdout);
        print('test case exec fail');
        result = False;
        break;
    print('group ' + self.groupPath + ' run result: ' + str(result) +'\n\n');
    return result;

  def Clear (self):
    for case in self.caseList:
      case.Clear();
    for key in self.enbList.keys():
      self.enbList[key].Clear();
    print(self.groupPath + " Clear");

  def GetNrbEnb(self, aotmEnb):
    for enb in self.enbList:
      if self.enbList[enb].type != aotmEnb.type:
        return self.enbList[enb];
    return None;

  def GetEnb(self, type):
    for enb in self.enbList:
      if self.enbList[enb].type == enb:
        return self.enbList[enb];
    return None;

  def GetEnbByEnbId(self, enbId):
    for enb in self.enbList:
      if int(self.enbList[enb].enbId) == enbId:
        return self.enbList[enb];
    return None;

  def SetUeGrp(self, ueGrpId):
    if ueGrpId in self.ueGrpList:
      return;
    self.ueGrpList[ueGrpId] = {};
    ueInfo = UeGrp(ueGrpId);
    self.ueGrpList[ueGrpId] = ueInfo;

  def DelUeGrp(self, ueGrpId):
    del self.ueGrpList[ueGrpId];