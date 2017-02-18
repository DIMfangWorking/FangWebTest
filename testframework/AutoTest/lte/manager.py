# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__=['ManagerImp'];

import os;
import pdb;
import datetime;
import sys;
import socket;

import manager;
from TestCaseGroup import TestCaseGroup;

class GeneralManager(object):
  def __init__(self, args):
    for key in args:
      setattr(self, key, args[key]);

    if 'subcommand' in args.keys() and 'test' == args['subcommand'] :
      self.env = 'real';
    else:
      self.env = 'sim';

    if self.slaveUEIP:
      self.slaveUEIP = socket.inet_ntoa(self.slaveUEIP);

    self.TestCaseListFile ='';
    self.TestCaseGroupList = [];
    self.initCfg = {};
    self.TaskLogPath = '';
    self.LoadTestCaseGroup();

    self.TestCaseGroupPath = self.grouppath;

    self.initLogPath();

  def GetTestCaseGroupList (self):
    pass;

  def Run (self):
    if not 'TestTask' in self.initCfg:
      print('no test task')
      return
    result = True

    for GroupItem in self.initCfg['TestTask']:
      if GroupItem.tag == 'TestCaseGroup':
        test_case_group = TestCaseGroup(self, GroupItem)
        if test_case_group.Run() == False:
          result = False;
          test_case_group.Clear();
          break;
        test_case_group.Clear();

  def LoadTestCaseGroup(self):
    FileName = self.grouppath + os.sep + self.file;
    doc = tree.parse(FileName);
    root = doc.getroot();
    if (root.tag != 'InitConfig'):
      print(" Start Config XML is Invalid");
      return;
    for item in root:
      self.initCfg[item.tag] = item;

class LMTManage(object):
  def __init__(self, argv):
    pass;

  def Run(self):
    from real.LMTInterface import RemoteRequest;
    RemoteRequest('17.31.16.230', '80');

def Manager(argv):
  if 'subcommand' in argv.keys() and 'uploadCGI' == argv['subcommand'] :
      return LMTManage(argv);

  return GeneralManager(argv);