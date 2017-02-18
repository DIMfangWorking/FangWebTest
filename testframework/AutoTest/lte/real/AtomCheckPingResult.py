# -*- coding:utf-8 -*-
import threading
import pdb
import httplib
import json
import socket;
import struct;

import time;

from Atom import Atom;

from logger import getLogger;
logger = getLogger();

class AtomCheckPingResult(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.enb = self.case.group.GetEnb('src_enb')
    self.testMng = case.group.testMng;

    self._ei_basic_data = {};

    try:
      self.result = int(self.subInfo['ExpectResult'])
      self.ueGrpId = int(self.subInfo['UEGroupID'])
    except:
      print('cfg check ping result error')
      return None

  def _CheckMuiltUEFlow(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay'])
      threading.Event().wait(int(self.subInfo['Delay']))

    result = True;
    headers = {"Content-type": "application/json", "Accept": "text/plain"};
    params = { };
    ues = self.enb.uegroup[self.ueGrpId];
    print type(ues);
    for ue in ues:
      print ' ue option id %d' %ue['FolwTask']['optionID']
      params["optionID"] = ue['FolwTask']['optionID'];
      print params
      conn = httplib.HTTPConnection(self.testMng.slaveUEIP, self.testMng.slaveUEPort, timeout = 10);
      conn.request("POST", "/UE/OptionResult", json.dumps(params), headers);
      response = conn.getresponse();
      status = response.status;
      data = response.read();
      conn.close();

      data = data.split("\r\n\r\n")[1];

      data = data.replace('\'', '"');

      result = json.loads(data);
      if status == 200 and result['result'] == 0:
        print "UE %18.18x ulthrput = %d" %(ue['imsi'], result['atom_result']['ULThrput']);
        if result['atom_result']['ULThrput'] == 0:
          print ""
          result = False;
        else :
          print " ping fail.";
      else :
        print 'slave ue result : ' + result["message"];
        result =  False;

    return result;

  def _EIBasicCallback(self, obj):
    logger.debug("AtomCheckPingResult %r", time.time());

    for cell in obj.keys():
      logger.debug("AtomCheckPingResult cell %r", cell);
      if not hasattr(obj[cell], 'ueGeneralList'):
        continue;

      logger.debug("AtomCheckPingResult u32UENum %r", obj[cell].ueGeneralList.u32UENum);

      for guid in obj[cell].ueGeneralList.ueDict.keys():
        ue = obj[cell].ueGeneralList.ueDict[guid];
        logger.debug("AtomCheckPingResult ue %r", ue);
        if ue.u32IP in self._ei_basic_data:
          logger.debug("AtomCheckPingResult append ue %r", ue);
          self._ei_basic_data[ue.u32IP].append(ue);
        else:
          logger.debug("AtomCheckPingResult add ue %r", ue);
          self._ei_basic_data[ue.u32IP] = [ue,];

  def _CheckEIUEFlow(self):
    self.enb.enb.regEIBasicCallback(self._EIBasicCallback);

    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    self.enb.enb.clearEIBasicCallback();

    result = True;

    uegroup = self.enb.uegroup[self.ueGrpId];
    for ue in uegroup:
      if 'FolwTask' not in ue or ue['FolwTask'] == None:
        print "UE(%18.18x) not performing a flow test." %(ue['imsi']);
        result = False;
        continue;

      params = {};
      headers = {"Content-type": "application/json", "Accept": "text/plain"};
      params["optionID"] = ue['FolwTask']['optionID'];

      conn = httplib.HTTPConnection(self.testMng.slaveUEIP, self.testMng.slaveUEPort, timeout = 10);
      conn.request("POST", "/UE/OptionResult", json.dumps(params), headers);
      conn.close();

      ue['FolwTask']['optionID'] = None;

      ip = struct.unpack("!I", socket.inet_aton(ue['ip']))[0]
      ueEIBasicData = self._ei_basic_data[ip];

      logger.info('ei basic data len %#x %r', ip, len(self._ei_basic_data[ip]))

      resultObj = {'ULThrput' : 0, 'DLThrput' : 0}
      for value in ueEIBasicData:
        resultObj['ULThrput'] += value.u32ULMacThrput;
        resultObj['DLThrput'] += value.u32DLMacThrput;

      resultObj['ULThrput'] = resultObj['ULThrput'] / 1024 / 1024 / len(ueEIBasicData);
      resultObj['DLThrput'] = resultObj['DLThrput'] / 1024 / 1024 / len(ueEIBasicData);

      print "UE %d opt = %s ulthrput = %d dlthrput = %d" %(ue['imsi'], ue['FolwTask']['opetionType'], resultObj['ULThrput'], resultObj['DLThrput']);
      if resultObj['ULThrput'] >= 0:
        pass;
      else:
        print " ULThrput fail. xml %d real %d" %(resultObj['ULThrput'], self.ulthrput);
        result = False;

    return result;

  def Run(self):
    self._CheckEIUEFlow();