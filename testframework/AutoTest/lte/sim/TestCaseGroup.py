# -*- coding:utf-8 -*-

import os,sys, traceback
if sys.platform == "win32":
    from xml import etree
else:
    from lxml import etree
from TestCase import TestCase;
from AtomEnb import AtomEnb;

class UeInfo:
    def __init__(self, name, ueIp, cellId = 0):
        self.name = name
        self.ueIp = ueIp
        self.cellId = cellId

    def setPingResult(self, rst):
        self.pingRst = rst

class UeGrp:
    def __init__(self, grpId):
        self.grpId = grpId
        self.rst = False
        self.ueList = []
        self.addUe()

    def addUe(self):
        ueIpNameList = os.popen("ifconfig |grep Link |grep ue|awk '{print $1}'").read().split('\n')
        for ueIpName  in ueIpNameList:
            if  ueIpName != ''and int(ueIpName[5:8]) == self.grpId:
                evt_ip = os.popen("ifconfig "+ ueIpName + "|grep 'inet addr'|awk '{print $2}'").read()
                evt_ip = evt_ip[evt_ip.find(':')+1:evt_ip.find('\n')]
                ueInfo = UeInfo(ueIpName, evt_ip, int(ueIpName[2:5]))
                self.ueList.append(ueInfo)

class RunFailException(Exception):
    def __init__(self, msg):
        super(RunFailException, self).__init__(msg);

class TestCaseGroup:
    def __init__ (self, testMng, group):
        self.testMng = testMng
        self.groupPath = group.get('name')
        print('\n\ngroup ' + self.groupPath + ' run begin')
        self.caseList = []
        self.caseCfg = []
        self.enbList = {}
        self.ueGrpList = {}
        self.groupLogPath = ''
        self.initGroupLog()
        self.LoadGroupCfg(group)

    def initGroupLog(self):
        self.groupLogPath = self.testMng.TaskLogPath + os.sep + self.groupPath
        if not os.path.exists(self.groupLogPath):
            os.mkdir(self.groupLogPath)
            print('mkdir ' + self.groupLogPath)

    def LoadGroupCfg(self, group):
        self.GrpName = group.get('name')
        for item in  group:
            if item.tag == 'EnbId':
                tag = item.get('name')
                if None == tag:
                    tag = 'src_enb'
                self.enbList[tag] = AtomEnb(item, self);
            elif item.tag == 'TestCase' :
                self.caseCfg.append(item)

    def Run (self):
        ret = False
        result = True
        for case in self.caseCfg:
            try:
                for enb in self.enbList:
                    self.enbList[enb].Run()
                test_case = TestCase(self, case)
                if test_case.Run() == False:
                    raise RunFailException(test_case.name +' result : False');
                for enb in self.enbList:
                    self.enbList[enb].Clear()
                self.caseList.append(test_case)
                result = True
            except RunFailException:
                for enb in self.enbList:
                    self.enbList[enb].Clear()
                print('test case exec fail')
                result = False
                break
            else :
                print sys.exc_info()
                traceback.print_exc(file=sys.stdout)
                for enb in self.enbList:
                    self.enbList[enb].Clear()
                print('test case exec fail')
                result = False
                break
        print('group ' + self.groupPath + ' run result: ' + str(result) +'\n\n')
        return result

    def Clear (self):
        for case in self.caseList:
            case.Clear()
        print(self.groupPath + " Clear")

    def GetNrbEnb(self, aotmEnb):
        for enb in self.enbList:
            if self.enbList[enb].type != aotmEnb.type:
                return self.enbList[enb];
        return None

    def GetEnb(self, type):
        for enb in self.enbList:
            if self.enbList[enb].type == enb:
                return self.enbList[enb]
        return None;

    def GetEnbByEnbId(self, enbId):
        for enb in self.enbList:
            if int(self.enbList[enb].enbId) == enbId:
                return self.enbList[enb];
        return None;

    def SetUeGrp(self, ueGrpId):
        if ueGrpId in self.ueGrpList:
            return
        self.ueGrpList[ueGrpId] = {}
        ueInfo = UeGrp(ueGrpId)
        self.ueGrpList[ueGrpId] = ueInfo

    def DelUeGrp(self, ueGrpId):
        del self.ueGrpList[ueGrpId]
