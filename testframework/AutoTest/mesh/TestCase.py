# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['TestCase'];

import os;
import sys;

from TestCaseInterface import TestCaseInterface;

class TestCase(TestCaseInterface):
  def __init__ (self, group, item):
    self.name = item['@name'];
    time = item['@times'];
    xml_file = group.testMng.TestCaseGroupPath + os.sep + group.groupPath + os.sep + 'TestCase_' + self.name + '.xml';

    TestCaseInterface.__init__(self, group, xmlfile, time);

  def BeforRun(self):
    TestCaseInterface.BeforRun(self);
    print('begin run ' + self.file_name);