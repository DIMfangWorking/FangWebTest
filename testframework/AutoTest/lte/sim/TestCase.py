# -*- coding:utf-8 -*-
import pdb
import os,sys
from CaseObj import CaseObj
if sys.platform == "win32":
    from xml import etree
else:
    from lxml import etree
class TestCase(CaseObj):
    def __init__ (self, group, item):
        self.name = item.get('name')
        group.testMng.resultReport.notifyStartRunTestCase(self.name)
        time = item.get('times')
        self.group = group
        CaseObj.__init__(self, self.group.testMng.TestCaseGroupPath + os.sep + group.groupPath + os.sep + 'TestCase_' + self.name + '.xml', time)
        print("TestCase:"+ self.file_name)
        self.loadTestCaseFile()
        
    def BeforRun(self):
        print('begin run ' + self.file_name)
        pass

    def AfterRun(self):
        pass

    def loadTestCaseFile (self):
        print("TestCase:loadTestCaseFile")
        self.ParseCase()
        
    def LogSave(self):
        print("TestCase:LogSave")

