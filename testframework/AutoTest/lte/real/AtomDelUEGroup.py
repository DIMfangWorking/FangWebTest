# -*- coding:utf-8 -*-
import threading
import pdb

from Atom import Atom

class AtomDelUEGroup(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.enb = self.case.group.GetEnb('src_enb')
    try:
      self.ueGrpId = int(self.subInfo['UEGroupID'])
      self.ueNum = int(self.subInfo['UENum'])
    except:
      print('cfg DelUEGroup check error')
      return None;

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    try :
      del self.enb.uegroup[self.ueGrpId][:self.ueNum - 1];
    except:
      print 'del ue group error';
      return False;

    return True;