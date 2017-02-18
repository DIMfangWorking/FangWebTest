# -*- coding:utf-8 -*-
import threading;
import pdb;
import struct;
import httplib;
import json;

from Atom import Atom;

class FlowAtom(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case);
    self.case = case;
    self.testMng = case.group.testMng;
    self.enb = self.case.group.GetEnb('src_enb');

    try:
      self.ueGrpId = int(self.subInfo['UEGroupID']);
      self.times = int(self.subInfo['Duration']);
    except AttributeError as err:
      print('cfg error');
      print(err);
      return None;

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    headers = {"Content-type": "application/json", "Accept": "text/plain"};
    for ue in self.enb.uegroup[self.ueGrpId]:
      try :
        if ue['FolwTask'] != None: 
          print "UE(%18.18x) performing a %s flow test." %(ue['IMSI'], ue["FolwTask"]["optionType"]);
          return False;
      except:
        pass

      params = self.constructRequestParams(ue);
      params = dict(params);

      ue['FolwTask'] = params if params else {};

      conn = httplib.HTTPConnection(self.testMng.slaveUEIP, self.testMng.slaveUEPort, timeout = 10);
      conn.request("POST", "/UE/Option", json.dumps(self.params), headers);
      response = conn.getresponse();
      status = response.status;
      data = response.read();
      conn.close();

      data = data.split("\r\n\r\n")[1];

      data = data.replace('\'', '"');

      result = json.loads(data);
      if status == 200 and result['result'] == 0:
        print 'task id is %d' %(result['optionID']);
        ue['FolwTask']['optionID'] = result['optionID'];
      else :
        print 'slave ue result : ' + result["message"];
        ue['FolwTask'] = None;
        return False;

    return True;

  def constructRequestParams(self, ue):
    pass;