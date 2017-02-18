# -*- coding:utf-8 -*-
from Atom import Atom
from Msg import DelUeGrp
import threading
import pdb

class AtomDelUEGroup(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.ueNum = int(self.subInfo['UENum'])
        except:
            print('cfg DelUEGroup check error')
            return None
        self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        self.msg = DelUeGrp(self.ueGrpId)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg.msgBuf, self.enbIp)
        print('Delay 10')
        threading.Event().wait(10)
        return True