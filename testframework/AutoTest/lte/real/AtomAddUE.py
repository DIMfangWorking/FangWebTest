# -*- coding:utf-8 -*-

import threading
import pdb
import httplib, urllib;
import json;

from Atom import Atom

SRC_ENB = 0
TGT_ENB = 1
class AtomAddUE(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.case = case;
    self.group = case.group;
    self.testMng = case.group.testMng;
    self.enb = self.case.group.GetEnb('src_enb');
    self.ueGrpId = int(self.subInfo['UEGroupID']);
    self.cellId = int(self.subInfo['CellID']);
    self.ueNum = int(self.subInfo['UENum']);

    if 'EnbType' in self.subInfo:
      self.enbIp = self.case.group.GetEnb(self.subInfo['EnbType']).enbIp
      if SRC_ENB == self.subInfo['EnbType']:
        self.enbType = SRC_ENB
      else:
        self.enbType = TGT_ENB

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    params = {"eNBId" : self.testMng.enbid, "cellId" : self.cellId, "number" : self.ueNum};
    headers = {"Content-type": "application/json", "Accept": "text/plain"};

    conn = httplib.HTTPConnection(self.testMng.slaveUEIP, self.testMng.slaveUEPort);
    conn.request("POST", "/UE/Online", json.dumps(params), headers);
    response = conn.getresponse();
    status = response.status;
    data = response.read();
    conn.close();
    
    data = data.split("\r\n\r\n")[1];
    print data;
    result = json.loads(data);
    if status == 200 and result['result'] == 0:
      print '%r' %(result['UE']);
      if len(result['UE']) == self.ueNum:
        try :
          if not ininstance(self.enb.uegroup[self.ueGrpId], list):
            self.enb.uegroup[self.ueGrpId] = [];
        except:
          self.enb.uegroup[self.ueGrpId] = [];

        self.enb.uegroup[self.ueGrpId].extend(result['UE']);

        return True;
      else :
        print 'online ue num is %d .but need ue %d' %(len(result['UE']), self.ueNum)
        return False;

    print 'slave ue result : ' + result["message"];

    return False;
