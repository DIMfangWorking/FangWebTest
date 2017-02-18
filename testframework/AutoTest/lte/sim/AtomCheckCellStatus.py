# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import CheckMsg
import threading
import pdb
class AtomCheckCellStatus(Atom,CheckMsg):
    def __init__(self, item, case):
        Atom.__init__(self,item, case);
        try:
            self.enbId = int(self.subInfo['EnbID']);
            self.result = int(self.subInfo['ExpectResult']);
        except:
            print('cfg cell check error');
            return None;

        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        self.enbIp = self.case.group.GetEnbByEnbId(self.enbId).enbIp;
        CheckMsg.__init__(self, Msg.MSG_CELL_STATUS_CHECK_REQ);
        pass;

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay']);
            threading.Event().wait(int(self.subInfo['Delay']));
        self.Receive(self.enbIp);
        self.Send(self.msgBuf, self.enbIp);
        threading.Event().wait(2);
        self.StopRcv();
        print('cell state check result: ' + str(self.checkResult));
        return self.checkResult;

    def MsgCheck(self, msg,addr = 0):
        if self.enbIp != addr[0]:
            print(addr[0] + ' remote ip err');
            return False;
        if msg[0] != Msg.MSG_CELL_STATUS_CHECK_RSP:
            return False;
        if msg[1] != 0:
            return False;
        if msg[2] != self.result:
            return False;
        return True;