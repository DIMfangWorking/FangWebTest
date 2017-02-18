# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import CheckBearSetupReqMsg
import threading
import pdb
class AtomCheckBearSetup(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.result = int(self.subInfo['ExpectResult'])
        except:
            print('cfg bear setup check error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        if 'EnbType' in self.subInfo:
            self.enbIp = self.case.group.GetEnb(self.subInfo['EnbType']).enbIp
        else:
            self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        self.msg = CheckBearSetupReqMsg(self.ueGrpId)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Receive(self.enbIp)
        self.Send(self.msg.msgBuf, self.enbIp)
        threading.Event().wait(2)
        self.StopRcv()
        print('bear setup check result: ' + str(self.checkResult))
        return self.checkResult

    def MsgCheck(self, msg,addr = []):
        if self.enbIp != addr[0]:
            print(addr[0] + ' remote ip err')
            return False
        if msg[0] != Msg.MSG_DEDICATED_BEARER_CHECK_RSP:
            return False
        if msg[2] != self.result:
            return False
        return True