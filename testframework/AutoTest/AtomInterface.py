# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['AtomInterface'];

import pdb;
import socket;
import struct;
import threading;

class AtomInterface(object):
  def __init__ (self, item, case):
    self.case = case;
    self.subInfo = {};
    self.stop = False;
    self.rcvMsg = None;
    self.checkResult = False;
    self.threading = None;

  def Run(self):
    print(str(self.__class__.__name__) + ' run');
    
  def Send(self, msg, ip):
    print(str(self.__class__.__name__) + ' send msg ' + str(struct.unpack('IIIIIIIIIIIIIIII',msg)));
    
    ADDR=(ip,50000);
    s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM);
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1);
    s.sendto(msg, ADDR);
    s.close()

  def RcvPf(self):
    ADDR=(self.ip,50001)
    try:
      server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)
      server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1)
      server.bind(ADDR)
      while not self.stop:
        (data, addr) = server.recvfrom(1500)
        if not data:
          continue
        else:
          if str(data) == '1111111111111111':
            continue
          self.Check('iiii',data, addr)
    except:
      print('socket err stop socket')

    server.close()
    #print(str(self.__class__.__name__) + ' stop receive threading')
    return

  def Receive(self, ip):
    #print(str(self.__class__.__name__) + ' start receive threading')
    self.ip = ip
    self.threading = threading.Thread(target= self.RcvPf)
    self.threading.setDaemon(True)
    self.threading.start()

  def StopRcv(self):
    self.stop = True

  def MsgCheck(self, msg, addr = []):
    return True

  def Check(self, fmt, data, addr = 0):
    pass;
  
  def Clear(self):
    # print(str(self.__class__.__name__) + " Clear")
    pass