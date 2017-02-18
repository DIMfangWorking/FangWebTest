# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['AtomAddNode']

import threading;
from AtomInterface import AtomInterface;
from mesh.MeshDevice import MeshDevice;

from logger import getLogger;

logger = getLogger();

class AtomAddNode(AtomInterface):
  def __init__(self, item, case):
    AtomInterface.__init__(self, item, case);
    self.Name = item['Name'];
    self.ID = int(item['ID']);
    self.NodeId = int(item['NodeID']);
    self.IP = item['IP'];
    self.NetMask = item['NetMask'];

    logger.info(case.group);
    self.Device = case.DeviceManager.addMeshDevice(self.Name, self.ID, self.NodeId, self.IP, self.NetMask);

  def Run(self):
    self.Device.run();
    return True;

  def Clear(self):
    self.Device.stop();