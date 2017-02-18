# -*- coding:utf-8 -*-
import os;
import socket;
import struct;
import json;
import threading;

from Atom import Atom;
from DbMng import RealDBOql;

import pdb

class AtomSetDataBase(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)

    try:
      self.enbId = int(self.subInfo['EnbID']);
      self.option = self.subInfo['Option'];
    except:
      raise Exception('cfg set data base error');

    self.enb = self.case.group.GetEnbByEnbId(self.enbId);
    self.option = json.loads(self.option);
    self.table = self.option['table'];
    self.option = self.option['option'];

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    table = RealDBOql(self.table, self.enb);
    for item in self.option:
      name = item['name'];
      arguments = item['arguments'];
      if len(arguments) == 0:
        print getattr(table, name)();
      elif len(arguments) == 1:
        getattr(table, name)(arguments[0]);
      elif len(arguments) == 2:
        getattr(table, name)(arguments[0], arguments[1]);

    return True;

  def MsgCheck(self, msg, addr =[]):
    return True;

  def Clear(self):
    pass