# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import HandOverReqMsg
import threading
import pdb
class AtomCheckHandOver(Atom,HandOverReqMsg):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.result = int(self.subInfo['ExpectResult'])
            self.ueGrpId = int(self.subInfo['UEGroupID'])
        except:
            print('cfg cell check error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        self.msg = HandOverReqMsg(self.ueGrpId)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Receive(self.enbIp)
        self.Send(self.msg.msgBuf, self.enbIp)
        threading.Event().wait(2)
        self.StopRcv()
        print('HandOver state check result: ' + str(self.checkResult))
        return self.checkResult

    def MsgCheck(self, msg, addr):
        if self.enbIp != addr[0]:
            print(addr[0] + ' remote ip err')
            return False
        if msg[0] != Msg.MSG_HAND_OVER_CHECK_REQ:
            return False
        if msg[1] != 0:
            return False
        if msg[2] != self.result:
            return False
        return True