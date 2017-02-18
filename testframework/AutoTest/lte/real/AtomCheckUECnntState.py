# -*- coding:utf-8 -*-
import threading
import pdb

from Atom import Atom
class AtomCheckUECnntState(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.enb = self.case.group.GetEnb('src_enb')
    self.ueGrpId = int(self.subInfo['UEGroupID'])
    self.result = int(self.subInfo['ExpectResult'])

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay'])
      threading.Event().wait(int(self.subInfo['Delay']))

    try :
      ues = self.enb.uegroup[self.ueGrpId];
    except:
      print 'not found ue gourp %d' %(self.ueGrpId);
      return False;

    return True;