# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__=['ManagerInterface'];

import os;
import pdb;
import datetime;
import sys;
import json;
import socket;
import xmltodict;

from logger import getLogger;

logger = getLogger();

class ManagerInterface(object):
  def __init__(self, args):
    object.__init__(self);

    for key in args:
      setattr(self, key, args[key]);

    self.TestCaseGroupPath = self.grouppath

    self.TestCaseListFile ='';
    self.TestCaseGroupList = [];

    self._initLogPath();
    self._loadTestCaseGroup();

  def _initLogPath(self):
    if not os.path.exists(self.logpath):
        os.mkdir(self.logpath);

    # self.TaskLogPath = self.logpath + os.sep + datetime.datetime.utcnow().strftime('%Y_%m_%d_%H%M%S')
    self.TaskLogPath = self.logpath;
    if not os.path.exists(self.TaskLogPath):
      os.mkdir(self.TaskLogPath);

  def _loadTestCaseGroup(self):
    FileName = self.grouppath + os.sep + self.file;

    xml = ''
    for line in open(FileName):
      xml += line;

    doc = xmltodict.parse(xml);

    if not 'InitConfig' in doc:
      print(" Start Config XML is Invalid. not found InitConfig");
      return;

    if not 'TestTask' in doc['InitConfig']:
      print(" Start Config XML is Invalid. not found TestTask");
      return;

    self.TestGroupConfig = doc['InitConfig'];

  def Run(self):
    result = True;
    conf = self.TestGroupConfig['TestTask'];

    logger.debug(conf);
    for GroupItem in conf.keys():
      if GroupItem == 'TestCaseGroup':
        test_case_group = self.TaskCaseGroupClass(self, conf[GroupItem]);
        if test_case_group.Run() == False:
          result = False;
          test_case_group.Clear();
          break;
        test_case_group.Clear();

  def Clean (self):
    pass;