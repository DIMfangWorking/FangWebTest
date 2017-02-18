# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import AddUeGrpReqMsg
import threading
import pdb
class AtomCheckUECnntState(Atom,AddUeGrpReqMsg):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.result = int(self.subInfo['ExpectResult'])
        except AttributeError as err:
            print('cfg ue connect check error')
            print(err)
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        AddUeGrpReqMsg.__init__(self, Msg.MSG_ADD_UE_GROUP_CHECK_REQ, self.ueGrpId, self.result)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Receive(self.enbIp)
        self.Send(self.msgBuf, self.enbIp)
        threading.Event().wait(2)
        self.StopRcv()
        print('ue state check result: ' + str(self.checkResult))
        self.case.group.SetUeGrp(self.ueGrpId)
        return self.checkResult

    def MsgCheck(self, msg,addr):
        if self.enbIp != addr[0]:
            print(addr[0] + ' remote ip err')
            return False
        if msg[0] != Msg.MSG_ADD_UE_GROUP_CHECK_RSP:
            return False
        if msg[2] != self.result:
            return False
        return True