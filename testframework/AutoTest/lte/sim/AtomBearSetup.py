# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import BearSetupCmdMsg
import threading
import pdb

class AtomBearSetup(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.qci = int(self.subInfo['Qci'])
        except:
            print('cfg bear setup check error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        if 'EnbType' in self.subInfo:
            self.enbIp = self.case.group.GetEnb(self.subInfo['EnbType']).enbIp
        else:
            self.enbIp = self.case.group.GetEnb('src_enb').enbIp

        self.msg = BearSetupCmdMsg(self.ueGrpId, self.qci)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg.msgBuf, self.enbIp)
        return True
