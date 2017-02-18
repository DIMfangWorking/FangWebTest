# -*- coding:utf-8 -*-
from Atom import Atom
import threading
import pdb

class AtomCheckCellStatus(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case);
    try:
      self.cell = int(self.subInfo['CellID']);
      self.result = int(self.subInfo['ExpectResult']);
    except:
      print('cfg cell check error');
      return None;

    self.enbIp = self.case.group.GetEnb('src_enb').enbIp;

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    result = self.case.group.GetEnb('src_enb').enb.lmtInterface.find('t_cel_para');
    return self.MsgCheck(result);

  def MsgCheck(self, result, addr = 0):
    if result['result'] == 0 :
      if self.cell == 255:
        for item in result['t_cel_para'] :
          if int(item['u32Status']) == self.result:
            pass
          else :
            print 'cell %s status is \'%s\'' %(item['u8CId'], item['u32Status'])
            return False;
        return True;
      else :
        for item in result['t_cel_para'] :
          if self.cell == int(item['u8CId']):
            if int(item['u32Status']) == self.result:
              return True;
            else :
              print 'cell %s status is \'%s\'' %(item['u8CId'], item['u32Status'])
              return False;
        print 'not found cell ' + str(self.cell);
        return False;
    else:
      print result['message']
      return False;