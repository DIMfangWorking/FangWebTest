# -*- coding:utf-8 -*-
from Atom import Atom
from Msg import PdnIpMsg, PingCmdMsg
import threading, subprocess
import pdb
import socket,struct,os
class AtomULPing(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.ueGrpId = int(self.subInfo['UEGroupID']);
            #self.pdnIp = int(self.subInfo['PDNIP'])
            self.pdnIp = int(socket.ntohl(struct.unpack('I',socket.inet_aton(self.subInfo['PDNIP']))[0]));
            self.pktLen = int(self.subInfo['PacketLen']);
            self.times = int(self.subInfo['Duration']);
            self.lchNum = int(self.subInfo['LchNum']);
        except AttributeError as err:
            print('cfg ul ping error');
            print(err);
            return None;
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        self.enbIp = self.case.group.GetEnb('src_enb').enbIp;
        self.pdnIpMsg = PdnIpMsg(self.ueGrpId, self.pdnIp, self.lchNum);
        #self.pingCmd = PingCmdMsg(self.ueGrpId ,self.pdnIp, self.pktLen, self.times)
        pass;

    def Run(self):
        if 'Delay' in  self.subInfo:
            print('Delay    ' + self.subInfo['Delay']);
            threading.Event().wait(int(self.subInfo['Delay']));
        self.Send(self.pdnIpMsg.msgBuf, self.enbIp);
        self.StartPing(self.ueGrpId);
        # self.Receive(self.enbIp)
        # self.Send(self.enbIp, self.pdnIpMsg.msgBuf)
        # threading.Event().wait(2)
        # self.Send(self.enbIp, self.pingCmd.msgBuf)
        # threading.Event().wait(2)
        # self.StopRcv()
        # print 'ue state check result: ' + str(self.checkResult)
        return True;

    def StartPing(self, ueGrpId):
        for ueGrp in self.case.group.ueGrpList:
            if False:
                for ue in self.case.group.ueGrpList[ueGrp].ueList:
                    total = '';
                    ips = ue.ueIp.split('.');
                    ping_ip = '10.'+ str(ue.cellId) + '.' +ips[2]+ '.' +ips[3];
                    print('ping ',ping_ip, self.pktLen, self.times);
                    self.pingPid = subprocess.Popen(['ping',ping_ip,'-s '+str(self.pktLen),'-c '+str(self.times)],stdout=subprocess.PIPE,stderr=subprocess.PIPE);
                    self.pingPid.wait();
                    (result,err)=self.pingPid.communicate();
                    print(result);
                    print(err);
                    lines = result.split('\n');
                    for line in lines:
                        if line.find('packets transmitted')>=0:
                            total += line +',';
                        if line.find('rtt')>=0:
                            total += line;
                    # self.pingPid.kill()
                    ue.setPingResult(total);
                    os.system('pkill ping');
                    print('pkill ping');
            else:
                total = '';
                if self.times == 0:
                  result = '\n\n0 packets transmitted, 0 received, 0% packet loss, time 0ms';
                else:
                  ips = self.case.group.ueGrpList[ueGrp].ueList[0].ueIp.split('.');
                  ping_ip = '10.'+ str(self.case.group.ueGrpList[ueGrpId].ueList[0].cellId) + '.' +ips[2]+ '.' +ips[3];
                  print('ping ',ping_ip, self.pktLen, self.times);
                  self.pingPid = subprocess.Popen(['ping',ping_ip,'-s '+str(self.pktLen),'-c '+str(self.times), '-w', '20'],stdout=subprocess.PIPE,stderr=subprocess.PIPE);
                  self.pingPid.wait();
                  (result,err)=self.pingPid.communicate();
                  print(result);
                  print(err);

                lines = result.split('\n');
                for line in lines:
                    if line.find('packets transmitted')>=0:
                        total += line +',';
                    if line.find('rtt')>=0:
                        total += line;
                #self.pingPid.kill()
                self.case.group.ueGrpList[ueGrpId].ueList[0].setPingResult(total);
                os.system('pkill ping');
                print('pkill ping');
                pass;

    def MsgCheck(self, msg,addr):
        return True

    def Clear(self):
        os.system('pkill ping')
