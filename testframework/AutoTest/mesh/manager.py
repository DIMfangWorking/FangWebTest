# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['ManagerImp'];

import os;
import pdb;
import datetime;
import sys;
import socket;

from ManagerInterface import ManagerInterface;
from mesh.TestCaseGroup import TestCaseGroup;

from mesh.sim.SyncAssist import SyncControl;

class ManagerImp(ManagerInterface):
  def __init__(self, argv):
    ManagerInterface.__init__(self, argv);
    self.TaskCaseGroupClass = TestCaseGroup;

    self.sync_control = SyncControl();

  def Run(self):
    result = self.sync_control.run_sync_control();
    if 0 != result:
      raise Exception('run SyncControl fail. return %d' %result);

    ManagerInterface.Run(self);

  def Clean(self):
    ManagerInterface.Clean(self);