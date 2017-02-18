# -*- coding:utf-8 -*-
import threading;
import pdb;
import time;
import json;
import httplib;

import socket;
import struct;

from logger import getLogger;
logger = getLogger();

from Atom import Atom;

class AtomCheckFlowResult(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.enb = self.case.group.GetEnb('src_enb');
    self.testMng = case.group.testMng;

    self._ei_basic_data = {};

    try:
      self.ueGrpId = int(self.subInfo['UEGroupID']);
      self.ulthrput = int(self.subInfo['ULThrput']);
      self.dlthrput = int(self.subInfo['DLThrput']);
    except:
      print('cfg check ping result error')
      return None

  def _CheckMuiltUEFlow(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    result = True;
    headers = {"Content-type": "application/json", "Accept": "text/plain"};
    uegroup = self.enb.uegroup[self.ueGrpId];
    print self.ulthrput, self.dlthrput
    for ue in uegroup:
      try :
        if ue['FolwTask'] == None:
          print "UE(%18.18x) not performing a flow test." %(ue['imsi']);
          result = False;
          continue;
      except:
        print "UE(%18.18x) not performing a flow test." %(ue['imsi']);
        result = False;
        continue;

      params = {};
      params["optionID"] = ue['FolwTask']['optionID'];


      conn = httplib.HTTPConnection(self.testMng.slaveUEIP, self.testMng.slaveUEPort, timeout = 10);
      conn.request("POST", "/UE/OptionResult", json.dumps(params), headers);
      response = conn.getresponse();
      status = response.status;
      data = response.read();
      conn.close();

      data = data.split("\r\n\r\n")[1];

      data = data.replace('\'', '"');

      resultObj = json.loads(data);
      if status == 200 and resultObj['result'] == 0:
        print "UE %d opt = %s ulthrput = %d dlthrput = %d" %(ue['imsi'], ue['FolwTask']['opetionType'], resultObj['atom_result']['ULThrput'], resultObj['atom_result']['DLThrput']);
        if resultObj['atom_result']['ULThrput'] >= self.ulthrput:
          pass;
        else:
          print " ULThrput fail. xml %d real %d" %(resultObj['atom_result']['ULThrput'], self.ulthrput);
          result = False;

        if resultObj['atom_result']['DLThrput'] >= self.dlthrput:
          pass;
        else:
          print "DLThrput check fail. xml %d real %d" %(resultObj['atom_result']['ULThrput'], self.dlthrput);
          result = False;

      else :
        print 'slave ue result : ' + resultObj["message"];
        result =  False;

      ue['FolwTask']['optionID'] = None;
    return result;

  def _EIBasicCallback(self, obj):
    logger.debug("AtomCheckFlowResult %r", time.time());

    for cell in obj.keys():
      logger.debug("AtomCheckFlowResult cell %r %r", cell, obj);
      if not hasattr(obj[cell], 'ueGeneralList'):
        continue;

      for guid in obj[cell].ueGeneralList.ueDict.keys():
        ue = obj[cell].ueGeneralList.ueDict[guid];
        logger.debug("AtomCheckFlowResult ue %r", ue);
        if ue.u32IP in self._ei_basic_data:
          self._ei_basic_data[ue.u32IP].append(ue);
        else:
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

      logger.info('ei basic data len %#x %r', ip, len(ueEIBasicData))

      resultObj = {'ULThrput' : 0, 'DLThrput' : 0}
      for value in ueEIBasicData:
        resultObj['ULThrput'] += value.u32ULMacThrput;
        resultObj['DLThrput'] += value.u32DLMacThrput;
        logger.debug('ei basic flow %#x ULThrput %r DLThrput %r', ip, resultObj['ULThrput'], resultObj['DLThrput']);

      resultObj['ULThrput'] = resultObj['ULThrput'] / 1024 / 1024 / len(ueEIBasicData);
      resultObj['DLThrput'] = resultObj['DLThrput'] / 1024 / 1024 / len(ueEIBasicData);

      print "UE %d opt = %s ulthrput = %d dlthrput = %d" %(ue['imsi'], ue['FolwTask']['opetionType'], resultObj['ULThrput'], resultObj['DLThrput']);
      if resultObj['ULThrput'] >= self.ulthrput:
        pass;
      else:
        print " ULThrput fail. xml %d real %d" %(resultObj['ULThrput'], self.ulthrput);
        result = False;

      if resultObj['DLThrput'] >= self.dlthrput:
        pass;
      else:
        print "DLThrput check fail. xml %d real %d" %(resultObj['DLThrput'], self.dlthrput);
        result = False;

    return result;

  def Run(self):
    return self._CheckEIUEFlow();