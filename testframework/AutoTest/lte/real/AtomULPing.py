# -*- coding:utf-8 -*-
import threading;
import pdb;
import struct;
import httplib;
import json;

from FlowAtom import FlowAtom;

class AtomULPing(FlowAtom):
  def __init__(self, item, case):
    FlowAtom.__init__(self,item, case);

    try:
      self.pdnIp = self.subInfo['PDNIP'];
    except AttributeError as err:
      print('cfg ul ping error');
      print(err);
      return None;

    self.params = {"opetionType" : "ping", "PDNIP" : self.pdnIp, "duration" : self.times};

  def constructRequestParams(self, ue):
    print "send ping %s" %(str(ue["imsi"]))
    self.params["IMSI"] = ue["imsi"];
    return self.params;