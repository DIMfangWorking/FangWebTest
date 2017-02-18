# -*- coding:utf-8 -*-
import os
import pdb
import datetime
import sys
import time
import Report
import socket
import redis

if sys.platform == "win32":
    import xml.etree.ElementTree as tree
else:
    import lxml.etree as tree

from Compile import Compile;
from TestCaseGroup import TestCaseGroup;

os.environ['LANG']="C.UTF-8";
os.environ['LANGUAGE']="C.UTF-8";
os.environ['LC_CTYPE']="C.UTF-8";
os.environ['LC_NUMERIC']="C.UTF-8";
os.environ['LC_TIME']="C.UTF-8";
os.environ['LC_COLLATE']="C.UTF-8";
os.environ['LC_MONETARY']="C.UTF-8";
os.environ['LC_MESSAGES']="C.UTF-8";
os.environ['LC_PAPER']="C.UTF-8";
os.environ['LC_NAME']="C.UTF-8";
os.environ['LC_ADDRESS']="C.UTF-8";
os.environ['LC_TELEPHONE']="C.UTF-8";
os.environ['LC_MEASUREMENT']="C.UTF-8";
os.environ['LC_IDENTIFICATION']="C.UTF-8";
os.environ['LC_ALL']="C.UTF-8";

def runCompile(url, revision, svn_user, svn_password, enbpath, resultReport):
    compile = Compile(url, revision, svn_user, svn_password)
    result = compile.downloadSource();
    resultReport.notifyDownloadCodeResult(url, revision, result);
    if result <> 0:
        raise Exception('download code error');

    result = compile.compile();
    resultReport.notifyCompileResult(Compile.log_file);
    if result <> 0:
        raise Exception('compile error');

    result = compile.moveFileToRunDir(enbpath);
    if result <> 0:
        raise Exception('move file error');

class Manager(object):
    def __init__(self, args):
        for key in args:
            setattr(self, key, args[key]);
        # time.sleep(999999) 
        self.TestCaseListFile =''
        self.TestCaseGroupList = []
        self.initCfg = {}
        self.TaskLogPath = ''
        self.resultReport = Report.ReportCIResult()
        self.redisClient = redis.StrictRedis(socket.inet_ntoa(self.redis), self.rport, db = 0)
        self.LoadTestCaseGroup()

        self.TestCaseGroupPath = self.grouppath

        self.initLogPath()

    def initLogPath(self):
        if not os.path.exists(self.logpath):
            os.mkdir(self.logpath)

        # self.TaskLogPath = self.logpath + os.sep + datetime.datetime.utcnow().strftime('%Y_%m_%d_%H%M%S')
        self.TaskLogPath = self.logpath;
        if not os.path.exists(self.TaskLogPath):
            os.mkdir(self.TaskLogPath)

    #暂时没用到 待后续补充
    def GetTestCaseGroupList (self):
        pass

    def Run (self):
        if not 'TestTask' in self.initCfg:
            print('no test task')
            return
        result = True;

        try :
            if 'Compile' in self.initCfg:
                xml = self.initCfg['Compile']
                runCompile(xml.get('url'), xml.get('revision'), xml.get('svn_user'),
                    xml.get('svn_password'), self.enbpath, self.resultReport);

            self.resultReport.notifyStartRunTest();

            for GroupItem in self.initCfg['TestTask']:
                if GroupItem.tag == 'TestCaseGroup':
                    test_case_group = TestCaseGroup(self, GroupItem)
                    if test_case_group.Run() == False:
                        result = False
                        test_case_group.Clear()
                        break
                    test_case_group.Clear()
        finally:
            self.redisClient.set(self.rkey+".ci_report",self.resultReport.generateEmailContent());

    def LoadTestCaseGroup(self):
        FileName = self.grouppath + os.sep + self.file;
        doc = tree.parse(FileName);
        root = doc.getroot();
        if (root.tag != 'InitConfig'):
            print(" Start Config XML is Invalid")
            return
        for item in root:
            self.initCfg[item.tag] = item