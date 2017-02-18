# -*- coding:utf-8 -*-

__all__ = ['DbMng', 'RealDBOql'];

import os,re
import sqlite3
import sys
import threading;
import copy;
from collections import OrderedDict;

from DbManager import DBOQL;

class RealDBOql(DBOQL):
  def __init__(self, table, enb):
    DBOQL.__init__(self, table, enb);
    self.lmtInterface = self.enb.enb.lmtInterface;

  def save(self, argv):
    print 'save %s values %s ' %(self.table, argv);
    result = self.lmtInterface.insertDict(self.table, argv);
    return result;

  def insert(self, argv):
    return self.save(argv);

  def delete(self, argv):
    print 'remove %s where %s' %(self.table, argv);
    if isinstance(argv, dict) and len(argv) > 0:
      result = self.lmtInterface.deleteDict(self.table, argv);
    else :
      result = self.find();
      for data in result:
        self.lmtInterface.deleteDict(self.table, data);
    return result;

  def remove(self, argv):
    return self.delete(argv);

  def __overwriteField(self, data, argv):
    for key in argv :
      if self.table.lower() == 't_cel_para':
        if key == 'u8RedSrvCellRsrp' :
          data[key] = str(int(argv[key]) - 141);
          continue;
        elif key == 'u8sMeasure' :
          data[key] = str(int(argv[key]) - 141);
          continue;
      if self.table.lower() == 't_cel_dlpc':
        if key == 'u16CellSpeRefSigPwr':
          data[key] = str(int(data[key]) - 60);
          continue;
      data[key] = argv[key];

    return data;

  def __overwriteCelPara(self, data):
    if self.table.lower() == 't_cel_para':
      for key in data :
        if key == 'u8RedSrvCellRsrp' :
          data[key] = str(int(data[key]) - 141);
          continue;
        elif key == 'u8sMeasure' :
          data[key] = str(int(data[key]) - 141);
          continue;
    if self.table.lower() == 't_cel_dlpc':
      for key in data :
        if key == 'u16CellSpeRefSigPwr':
          data[key] = str(int(data[key]) - 60);
          continue;

  def update(self, filter, argv):
    print 'update %s set %s where %s' %(self.table, argv, filter);

    result = self.find(filter);

    if isinstance(result, list) and len(result) > 0:
      for data in result:
        self.__overwriteCelPara(data);
        self.__overwriteField(data, argv);
        result1 = self.lmtInterface.updateDict(self.table, data);
    else :
      if len(result) > 0:
        self.__overwriteCelPara(result);
        self.__overwriteField(result, argv);
        result1 = self.lmtInterface.updateDict(self.table, result);
      else:
        result1 = True;

    if isinstance(result1, dict) and 'result' in result1 and result1['result'] == 0:
      return result1;
    else :
      raise Exception(result1);

  def overwrite(self, filter, argv):
    print 'overwrite %s set %s where %s' %(self.table, argv, filter);
    result = self.find(filter);

    result1 = True;
    if isinstance(result, list):
      for data in result:
        result1 = self.remove(filter);
        self.__overwriteField(data, argv);
        result1 = self.lmtInterface.insertDict(self.table, data);
    else :
      self.__overwriteField(result, argv);
      if len(result) > 0:
        result1 = self.remove(filter);
      result1 = self.lmtInterface.insertDict(self.table, result);

    return result1;

  def find(self, filter = None):
    result = self.select(filter);
    return result;

  def select(self, filter = None):
    if filter and len(filter) > 0:
      result = self.lmtInterface.findOneDict(self.table, filter);
      if self.table in result:
        result = result[self.table];
      else :
        raise Exception(result['message'], 'gb2342');
    else :
      result = self.lmtInterface.find(self.table)[self.table];
    return result;

class DbMng:
  def __init__(self, testMng, enb):
    self.testMng = testMng;
    self.enb = enb
    self.options = []
    self.lmtInterface = self.enb.enb.lmtInterface;
    self.tablesOption = {};

  def setOption(self, options):
    self.options = options;