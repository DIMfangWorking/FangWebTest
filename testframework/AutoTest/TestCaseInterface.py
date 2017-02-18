# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['TestCaseInterface'];

import os;
import sys;
import imp;
import json;
import xmltodict;
import inspect;

from logger import getLogger;

logger = getLogger();

class TestCaseInterface(object):
  def __init__(self, group, file, time):
    logger.info('TestCaseInterface file %r time %r', file, time)

    self.group = group;
    self.testMng = group.testMng;

    DeviceManagerClass = self._getDeviceManagerClass();

    self.DeviceManager = DeviceManagerClass(self);

    self.file_name = file
    self.path = os.path.dirname(file);
    self.times = time;
    self.atomList = [];
    self.atomObjTab = {};
    self._uptObjTab();

    self._loadTestCaseFile();

  def _getDeviceManagerClass(self):
    DeviceManagerClass = self.testMng.Project.lower() + '.DeviceManager'
    DeviceManagerClass = __import__(DeviceManagerClass);
    DeviceManagerClass = getattr(DeviceManagerClass, 'DeviceManager');
    DeviceManagerClass = getattr(DeviceManagerClass, 'DeviceManager');

    return DeviceManagerClass;

  def _loadTestCaseFile (self):
    print("TestCase:loadTestCaseFile");
    self._parseCase();

  def _uptObjTab(self):
    env = self.group.AtomModulePath;
    prefix = self.group.AtomModulePrefix
    strPrefix = '';
    for item in prefix:
      strPrefix += item + '.';

    strPrefix = strPrefix[:len(strPrefix) - 1];

    logger.info('test case env %r', env);

    file_list = os.listdir('AutoTest');
    for AtomFile in file_list:
      if 7 < len(AtomFile) and '.py' == AtomFile[-3:] and 'Atom'== AtomFile[:4]:
        classString = AtomFile.split('.')[0];
        self.atomObjTab[classString[4:]] = getattr(__import__(classString), classString);

    file_list = os.listdir('AutoTest'+ os.sep + env);
    for AtomFile in file_list:
      if 7 < len(AtomFile) and '.py' == AtomFile[-3:] and 'Atom'== AtomFile[:4]:
        classString = AtomFile.split('.')[0];
        importString = strPrefix + '.' + classString;

        module = __import__(importString);
        for item in prefix[1:]:
          module = getattr(module, item);

        module = getattr(module, classString);
        self.atomObjTab[classString[4:]] = getattr(module, classString);

  def _parseCase(self):
    doc = '';
    for line in open(self.file_name):
      doc += line;
    doc = xmltodict.parse(doc);

    root = doc['TestCase']['AtomAction'];

    for item in root:
      logger.info('xml item %r', item);
      atomObj = self._newTagAtom(item, self);
      if None == atomObj:
      	if '@name' in item:
      	  print 'not support atom : %s' %item['@name'];
        continue;
      self.atomList.append(atomObj);

  def _newTagAtom(self, TagItem, case):
    logger.info('TagItem %r', TagItem);
    action = TagItem['@name'];

    actionCfg = {};
    for item in TagItem['Property']:
      actionCfg[item['@name']] = item['@value'];

    if action in self.atomObjTab:
      return self.atomObjTab[action](actionCfg, case);
    # else:
    #   for aotmItem in TagItem:
    #     return self.NewTagAtom(aotmItem, case);

    logger.info("not found atom %s", item['@name']);

    return None;

  def BeforRun(self):
    pass;

  def AfterRun(self):
    pass;

  def Run(self):
    print('run ' + str(self.__class__))
    for time in self.times:
      self.BeforRun();
      current = 1;
      logger.debug('test case run. %r', inspect.stack());
      for atomObj in self.atomList:
        print 'Start runing ' + atomObj.__class__.__name__;
        self.group.stepInfoManager.stepAtom(atomObj, current);
        if (atomObj.Run() == False):
          print('run ' + str(atomObj.__class__.__name__) + ' result : False')
          return False;
        current += 1;
        print atomObj.__class__.__name__ + ' running end'
      self.AfterRun();
    return True;

  def Clear(self):
    for atomObj in self.atomList:
      atomObj.Clear();
      del atomObj;