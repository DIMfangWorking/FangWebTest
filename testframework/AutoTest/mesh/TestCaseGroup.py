# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['DeviceManager'];

import os;
import sys;
import traceback;
import socket;

from TestCaseGroupInterface import TestCaseGroupInterface;
from mesh.TestCase import TestCase;

from mesh.DeviceManager import DeviceManager;

class TestCaseGroup(TestCaseGroupInterface):
  def __init__ (self, testMng, group):
    self.TestCaseClass = TestCase;
    TestCaseGroupInterface.__init__(self, testMng, group);
    self.AtomModulePath = 'mesh' + os.sep + testMng.Platform;
    self.AtomModulePrefix = ['mesh', testMng.Platform];