# -*- coding:utf-8 -*-
import threading;
import pdb;
import struct;
import httplib;
import json;
import socket;
import struct;

from FlowAtom import FlowAtom;

class AtomDLUDP(FlowAtom):
  def __init__(self, item, case):
    FlowAtom.__init__(self,item, case);

    try:
      self.pdnIp = self.subInfo['PDNIP'];
      self.banwitdth = int(self.subInfo['BandWitdth']);
    except AttributeError as err:
      print('cfg ul ping error');
      print(err);
      return None;

    self.params = {"opetionType" : "DLUDP", "PDNIP" : self.pdnIp, "DLBandWitdth" : self.banwitdth, "duration" : self.times};

  def constructRequestParams(self, ue):
    self.params['IMSI'] = ue["imsi"];
    ip = (struct.unpack("!I",socket.inet_aton(ue['ip']))[0])&0x000000FF;    
    self.params['DLPort'] = 8000 + ip;
    return self.params;