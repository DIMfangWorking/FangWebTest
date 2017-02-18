# -*- coding:utf-8 -*-
from Atom import Atom
import Msg
from Msg import CheckMsg
import threading
import pdb
class AtomCheckPingResult(Atom):
    def __init__(self, item, case):
        Atom.__init__(self,item, case)

        try:
            self.result = int(self.subInfo['ExpectResult'])
            self.ueGrpId = int(self.subInfo['UEGroupID'])
        except:
            print('cfg check ping result error')
            return None
        #self.enbHexIp =  self.case.group.GetEnbByEnbId(self.enbId).enbHexIp
        #self.enbIp = self.case.group.GetEnb('src_enb').enbIp
        #self.chkMsg = CheckMsg(Msg.MSG_PING_CHECK_REQ)
        pass

    def Run(self):
        rst = True
        print(str(self.__class__) + ' begin check')
        if False:
            for ue in self.case.group.ueGrpList[self.ueGrpId].ueList:
                PingRst = True
                print('    ping:'+ ue.pingRst)
                if ue.pingRst.find(', 0% packet loss,') < 0:
                    rst = False
                    PingRst = False
                print('ue %s ping check result:%s'%(ue.name, str(PingRst)))
        else:
            PingRst = self.case.group.ueGrpList[self.ueGrpId].ueList[0].pingRst
            print('    ping:'+ PingRst)


            if PingRst.find(', 0% packet loss,') < 0:
                rst = False
        print('ping check result:' + '<span class="text-success">' + str(rst) + '</span>')
        return rst

        # pingResult = ' 12 received, 60% packet loss, time 29022ms';

        # regular = re.compile("^ (?P<pack>) received, (?P<loss>)%% packet loss, time (?P<time>)ms$", re.DEBUG);
        # regular = re.compile(r"\s+(?P<pack>\d+)\s+received,\s+(?P<loss>\d+)%\s+packet\s+loss,\s+time\s+(?P<time>\d+)ms");

        # matchObj = regular.match(pingResult)
        # if matchObj:
        #   print matchObj.group('pack')
        #   print matchObj.group('loss')
        #   print matchObj.group('time')

        # matchObj = regular.search(pingResult)
        # if matchObj:
        #   print matchObj.group('pack')
        #   print matchObj.group('loss')
        #   print matchObj.group('time')

        # print regular.split(pingResult)

        # m = re.search('(?<=abc)def', 'abcdef')
        # print m.group(0)

    def MsgCheck(self, msg,addr):
        pass