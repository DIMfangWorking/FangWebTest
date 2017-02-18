# -*- coding:utf-8 -*-
from Atom import Atom
from Msg import HandOverCmdMsg
import threading
import pdb
class AtomHandOver(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID'])
            self.dstName = self.subInfo['DstEnbName']
            self.measId = int(self.subInfo['MeasId'])
            if 'tgt_enb' == self.dstName:
                self.type = 1
            else:
                self.type = 0
        except:
            print('cfg HandOver check error')
            return None
        self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        self.msg = HandOverCmdMsg(self.ueGrpId, self.type, self.measId)
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg.msgBuf, self.enbIp)
        threading.Event().wait(10)
        return True
