# -*- coding:utf-8 -*-
from Atom import Atom
import Msg,DbMng
import threading,os,socket,struct
import pdb

##define SOCKETSERVERNAME    ("/tmp/socket_server")
##define SOCKETCLIENTNAME    ("/tmp/socket_client")
##define SECSOCKETSERVERNAME  ("/tmp/socket_secserver")

SOCKETSERVERNAME = '/tmp/socket_server'
SOCKETCLIENTNAME = '/tmp/socket_client'
SECSOCKETSERVERNAME = '/tmp/socket_secserver'

class AtomSetDataBase(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.enbId = int(self.subInfo['EnbID'])
            self.cmd = self.subInfo['Cmd']
        except:
            print('cfg set data base  error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        self.enb = self.case.group.GetEnbByEnbId(self.enbId)
        db = DbMng.DbMng(self.enb.dbName)
        self.msg = db.SetDatabaseReqMsg(self.cmd)
        pass

    def Send(self, msg, ip = SOCKETCLIENTNAME):
        print(str(self.__class__) + ' send msg ' + str(struct.unpack('4H24s480sB3000sBI',msg)))
        if os.path.exists(SOCKETCLIENTNAME):
            os.unlink(SOCKETCLIENTNAME)
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.bind(SOCKETCLIENTNAME)
        if False:#self.enb.type == 'tgt_enb':
            s.connect(SECSOCKETSERVERNAME)
        else:
            s.connect(SOCKETSERVERNAME)
        rcvfmt = '!4HBIII500sI'
        bufsize = struct.calcsize(rcvfmt)
        s.send(msg)
        data = s.recv(bufsize)
        self.Check(rcvfmt,data)
        s.close()
        pass

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay'])
            threading.Event().wait(int(self.subInfo['Delay']))
        self.Send(self.msg)
        threading.Event().wait(2)
        print('set data base result: ' + '\033[1;31m' + str(self.checkResult) + '\033[m')
        return self.checkResult

    def MsgCheck(self, msg,addr =[]):
        if msg[5] != 0:
            return False
        return True

    def Receive(self, ip):
        pass