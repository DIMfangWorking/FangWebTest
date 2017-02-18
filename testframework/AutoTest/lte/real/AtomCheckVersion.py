# -*- coding:utf-8 -*-
import threading, subprocess
import pdb
import socket,struct,os

import xmltodict, json

from Atom import Atom;
from LMTInterface import RemoteRequest;

class AtomCheckVersion(Atom):
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

    RemoteRequest('17.31.16.230', '80').uploadWBS();

    result = self.case.group.GetEnb('src_enb').enb.lmtInterface.find('t_swpkg');
    if result['result'] == 0 :
      for item in result['t_swpkg'] :
      	if int(item['u8RunStatus']) == 1:
      	  pkgVer = 'McLTE.' + item['au8PkgVer'] + '.BIN'
      	  if pkgVer == self.version :
      	    return True;
      	  else:
      	    print 'swpkg au8PkgVer not \'' + self.version + '\' is \'' +  item['au8PkgVer'] +'\''
      	    return False;
    else:
      print result['message']

    return False;

  def MsgCheck(self, msg,addr):
    return True

  def Clear(self):
    pass;