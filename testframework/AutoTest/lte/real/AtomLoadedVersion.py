# -*- coding:utf-8 -*-
import threading, subprocess
import pdb
import socket,struct,os

import xmltodict, json

from Atom import Atom

class AtomLoadedVersion(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.case = case;
    try:
      self.version = self.subInfo['VersionName'];
    except AttributeError as err:
      print('cfg loaded version error');
      print(err);
      return None;
    self.enbIp = self.case.group.GetEnb('src_enb').enbIp;
    pass;

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    result = self.case.group.GetEnb('src_enb').enb.lmtInterface.uploadVersion(self.case.group.testMng.versionpath + os.sep + self.version);

    if result == True or result != 0:
      resultXml = self.case.group.GetEnb('src_enb').enb.lmtInterface.active();
      result = resultXml['result']
      if result != 1 and result != 0:
        print resultXml['message'];
        result = False;
      else:
        result = True;

    return result;

  def MsgCheck(self, msg,addr):
    return True

  def Clear(self):
    pass;