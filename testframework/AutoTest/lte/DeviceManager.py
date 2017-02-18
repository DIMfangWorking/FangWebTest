# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['DeviceManagerInterface'];

import socket
import subprocess
import struct
import os
import pdb
import datetime
import signal
import shlex

from DbManager import *;
from DeviceManagerInterface import DeviceManagerInterface;

class DeviceManager(DeviceManagerInterface):
  def __init__(self, item, group):
    DeviceManagerInterface.__init__(self, item, group);
    self.LoadSubInfo(item);
    self.initEnbInfo();
    self.dbOption = [];
    self.uegroup = {};

    if self.testMng.env == 'real':
      from real.AtomEnb import AtomEnb;
    else :
      from sim.AtomEnb import AtomEnb;
    self.enb = AtomEnb(item, self);

    self.dbm = DBOption(self.testMng, self);

  def LoadSubInfo(self, item):
    self.type = item.get('name');
    if self.type == None:
      self.type = 'src_enb';
    self.enbId = item.text;

  def initEnbInfo(self):
    self.enbName = self.testMng.enbname;
    self.enbPreId = str(int(self.enbId))
    self.cellId1 = int(self.enbId) + 1
    self.cellId2 = int(self.enbId) + 2
    self.phyCellId = str(self.enbId)
    self.phyCellId1 = str(self.cellId1)
    self.phyCellId2 = str(self.cellId2)
    self.enbIp = socket.inet_ntoa(self.testMng.enbip);

    self.enbHexPackStringIp = hex(int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0])))[2:];
    self.startTime = datetime.datetime.utcnow().strftime('%Y_%m_%d_%H%M%S');

  def Run(self):
    return self.enb.Run();

  def Clear(self):
    return self.enb.Clear();