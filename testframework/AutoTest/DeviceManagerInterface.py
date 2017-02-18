# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['DeviceManagerInterface'];

import os;
import sys;
import socket;
import subprocess;
import struct;

from logger import getLogger;

logger = getLogger();

class DeviceManagerInterface(object):
  def __init__(self, testcase):
    self.testcase = testcase;
    self.testMng = testcase.group.testMng;
    self.group = testcase.group;
    self.logPath = self.group.groupLogPath;

    self.device = {};

  def addDevice(self, id, device):
    dbm = DBOption(self, device);

    setatttr(device, 'dbm', dbm);

    self.device[id] = device;

  def getDevice(self, id):
  	if id in self.device:
  	  return self.device[id];
  	return None;

  def Clear(self):
  	try:
  	  for (key, value) in self.device:
  	    value.Clear();
  	except:
  	  logger.error('%r', sys.exec_info());