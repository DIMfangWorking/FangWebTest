# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import AddUeGrpCmdMsg
import threading
import pdb

SRC_ENB = 0
TGT_ENB = 1
class AtomAddUE(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.ueNum = int(self.subInfo['UENum'])
        except:
            print('cfg cell check error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        if 'EnbType' in self.subInfo:
            self.enbIp = self.case.group.GetEnb(self.subInfo['EnbType']).enbIp
            if SRC_ENB == int(self.subInfo['EnbType']):
                self.enbType = SRC_ENB
            else:
                self.enbType = TGT_ENB
        else:
            self.enbIp = self.case.group.GetEnb('src_enb').enbIp
            self.enbType = SRC_ENB

        self.msg = AddUeGrpCmdMsg(Msg.MSG_ADD_UE_GROUP_CMD, self.ueGrpId, self.ueNum, self.enbType)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg.msgBuf, self.enbIp)
        return True
