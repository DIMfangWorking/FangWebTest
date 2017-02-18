# -*- coding:utf-8 -*-
import threading;
import pdb;
import struct;
import httplib;
import json;

import xmltodict;

from Atom import Atom;

class AtomEIDetail(Atom):
  def __init__(self, item, case):
    Atom.__init__(self, item, case);
    self.case = case;
    self.group = case.group;
    self.testMng = case.group.testMng;
    self.enb = self.case.group.GetEnb('src_enb');

    self.msg = {};

    for node in item:
      ele = node.get('name');
      if ele == 'msg':
        msg = int(node.get('msg'));
        dspid = int(node.get('DspId'));
        coreid = int(node.get('CoreId'));

        self.msg[msg] = {'MsgId': msg, 'DspId' : dspid, 'CoreId' : coreid, 'Tlv' : []};

        tlvs = node.getchildren();

        for tlv in tlvs:
          tlvid = int(tlv.get('id'));
          tlvmsg = tlv.get('name');
          self.msg[msg]['Tlv'].append({'id':tlvid, 'name' : tlvmsg})


  def Run(self):
    self.enb.enb.ei.startAllDetail(self.msg);

  def clear(self):
    pass;