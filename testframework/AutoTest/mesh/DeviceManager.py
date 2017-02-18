# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['DeviceManager'];

from DbManager import DBOption;
from DeviceManagerInterface import DeviceManagerInterface;

class DeviceManager(DeviceManagerInterface):
  def __init__(self, case):
    DeviceManagerInterface.__init__(self, case);

  def addMeshDevice(self, name, id, nodeId, ip, mask = '255.255.255.0'):
  	meshDevice = MeshDevice(self, name, id, nodeId, ip, mask);
  	self.addDevice(id, meshDevice);

  def getMeshDevice(id):
    return getDevice(id);