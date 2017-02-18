# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import ReestablishmentCmdMsg
import threading
import pdb

class AtomReestablishment(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
        except:
            print('cfg Reestablishment check error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        if 'EnbType' in self.subInfo:
            self.enbIp = self.case.group.GetEnb(self.subInfo['EnbType']).enbIp
        else:
            self.enbIp = self.case.group.GetEnb('src_enb').enbIp

        self.msg = ReestablishmentCmdMsg(self.ueGrpId)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg.msgBuf, self.enbIp)
        return True
