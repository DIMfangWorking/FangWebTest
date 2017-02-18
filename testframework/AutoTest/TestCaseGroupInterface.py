#-*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['TestCaseGroupInterface'];

import os;
import sys;
import traceback;
import socket;
import redis;
from logger import getLogger;

logger = getLogger();

class RunFailException(Exception):
  def __init__(self, msg):
    super(RunFailException, self).__init__(msg);

class StepInfo(object):
  def __init__(self, group, caseLength):
    self.group = group;
    self.redis = None;

    if hasattr(group.testMng, 'redis') and hasattr(group.testMng, 'rport'):
      self.redis = redis.StrictRedis(socket.inet_ntoa(group.testMng.redis), group.testMng.rport, db = 0);
      self.redis.hset(self.group.testMng.rkey + '.step', 'testcase.total', caseLength);

  def stepTestcase(self, testcase, index):
    if self.redis:
      self.redis.hset(self.group.testMng.rkey + '.step', 'testcase', testcase.name);
      self.redis.hset(self.group.testMng.rkey + '.step', 'testcase.current', index);
      self.redis.hset(self.group.testMng.rkey + '.step', 'atom.total', len(testcase.atomList));

  def stepAtom(self, atom, index):
    if self.redis:
      self.redis.hset(self.group.testMng.rkey + '.step', 'atom', atom.__class__.__name__[4:]);
      self.redis.hset(self.group.testMng.rkey + '.step', 'atom.current', index);

class TestCaseGroupInterface(object):
  def __init__(self, testMng, group):
    self.testMng = testMng;
    self.groupPath = group['@name'];
    print('group ' + self.groupPath + ' run begin\n\n');
    self.caseList = [];
    self.caseCfg = [];
    self.groupLogPath = '';

    self.stepInfoManager = StepInfo(self, len(self.caseCfg));

    self.TaskLogPath = self.testMng.logpath;

    self._initGroupLog();
    self._loadGroupCfg(group);

  def _initGroupLog(self):
    self.groupLogPath = self.testMng.TaskLogPath + os.sep + self.groupPath;
    if not os.path.exists(self.groupLogPath):
      raise Exception('not found test group dir %r', self.groupLogPath)

  def _loadGroupCfg(self, group):
    self.GrpName = group['@name'];
    if isinstance(group['TestCase'], list):
      for item in group['TestCase']:
        self.caseCfg.append(item);
    else:
      self.caseCfg.append(group['TestCase']);

  def Run (self):
    result = True;
    index = 1;

    logger.debug('test group cfg : %r', self.caseCfg)

    for case in self.caseCfg:
      try:
        logger.debug('TestCaseClass %r', self.TestCaseClass);
        test_case = self.TestCaseClass(self, case);
        self.stepInfoManager.stepTestcase(test_case, index);
        if test_case.Run() == False:
          raise RunFailException(test_case.name +' result : '+ str(False));
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
    print(self.groupPath + " Clear");