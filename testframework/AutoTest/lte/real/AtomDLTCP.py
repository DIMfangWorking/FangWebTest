# -*- coding:utf-8 -*-
import threading;
import pdb;
import struct;
import httplib;
import json;
import socket;
import struct;

from FlowAtom import FlowAtom;

class AtomDLTCP(FlowAtom):
  def __init__(self, item, case):
    FlowAtom.__init__(self,item, case);

    try:
      self.pdnIp = self.subInfo['PDNIP'];
    except AttributeError as err:
      print('cfg ul ping error');
      print(err);
      return None;

    self.params = {"opetionType" : "DLTCP", "PDNIP" : self.pdnIp, "duration" : self.times};

  def constructRequestParams(self, ue):
    self.params['IMSI'] = ue["imsi"];
    ip = (struct.unpack("!I",socket.inet_aton(ue['ip']))[0])&0x000000FF;
    self.params['DLPort'] = 8000 + ip;
    return self.params;