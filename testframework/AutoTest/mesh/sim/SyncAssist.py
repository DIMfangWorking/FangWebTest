# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['SyncControl']

import socket
import time
import threading
import struct
import os
import pdb
import subprocess
import sys
import Log

NodeLock = threading.Lock()

if sys.platform == "win32":
  class SyncControl:
    def __init__(self):
      pass;
    def run_sync_control(self):
      return 0;
else:
  from pytun import TunTapDevice
  class SyncControl:
    def __init__(self):
      self.__ip_prefix = '172.88.1.'
      self.__sync_ip = self.__ip_prefix + '200'
      self.__src_port = 0x6000
      self.__dst_port = 0x6000
      self.__node_dict = {}
      self.__received_dict = {}
      self.__sys_frm_num = 0
      self.__sync_count = 0
      self.__running_flag = True

    def __create_tun(self, ip_sec):
      tun = TunTapDevice(name='SYNC' + ip_sec)
      tun.addr = self.__ip_prefix + ip_sec
      tun.netmask = '255.255.255.0'
      tun.persist(True)
      tun.up()

    def receive_proc(self):
      receiver = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
      receiver.bind((self.__sync_ip,self.__src_port))
      buff_size = 4096
      global NodeLock

      while True == self.__running_flag:
        data, addr = receiver.recvfrom(buff_size)
        msg_type, frm_num, node_id = struct.unpack('3I', data)

        NodeLock.acquire()
        self.__sync_count = self.__sync_count + 1

        if True != self.__received_dict.has_key(node_id):
          self.__received_dict[node_id] = self.__ip_prefix + str(node_id)
          # Log.log_trace('Add Recv NodeId %d' % node_id)

        if True != self.__node_dict.has_key(node_id):
          self.__node_dict[node_id] = self.__ip_prefix + str(node_id)
          # Log.log_trace('Add NodeId %d' % node_id)

        NodeLock.release()
        # print ' Receive Sync Info node_id: ', node_id

    def send_proc(self):
      send_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
      time_out_count = 0
      global NodeLock

      while True == self.__running_flag:
        if len(self.__node_dict) == 0:
          time.sleep(0.001)
          continue

        if len(self.__node_dict) <= self.__sync_count:
          time_out_count = 0
          self.__sys_frm_num = (self.__sys_frm_num>>4) * 10 + (self.__sys_frm_num & 0xF) + 1
          self.__sys_frm_num = ((self.__sys_frm_num / 10)<<4) + self.__sys_frm_num % 10

          NodeLock.acquire()
          self.__sync_count = 0

          for node_id in self.__node_dict.keys():
            addr = (self.__ip_prefix + str(node_id), self.__dst_port)
            data = struct.pack('2I', 8888, self.__sys_frm_num)
            send_socket.sendto(data, addr)

          self.__received_dict = {}
          NodeLock.release()
        else:
          time.sleep(0.001)
          time_out_count = time_out_count + 1
          if time_out_count == 10000:
            # print 'Time out '
            # pdb.set_trace()
            # for node_id in node_dict.keys():
            self.__sys_frm_num = self.__sys_frm_num + 1
            NodeLock.acquire()

            for node_id in self.__received_dict.keys():
              addr = (self.__ip_prefix + str(node_id), self.__dst_port)
              data=struct.pack("2I", 8888, self.__sys_frm_num)
              send_socket.sendto(data, addr)
              # print 'Time Out -- Send Sync Info ',sys_frm_num,addr
            self.__node_dict = {}
            self.__received_dict = {}
            self.__sync_count = 0

            NodeLock.release()

    def run_sync_control(self):
      dbg_trace = Log.DebugTrace('run_test sync control')
      sync_ip = '200'
      self.__create_tun(sync_ip)

      node_id = 0
      while node_id < 8:
        self.__create_tun(str(node_id))
        node_id = node_id + 1

      recv_thread = threading.Thread(target=self.receive_proc)
      recv_thread.setDaemon(True)
      recv_thread.start()

      send_thread = threading.Thread(target=self.send_proc)
      send_thread.setDaemon(True)
      send_thread.start()

      return 0

    def stop_sync_control(self):
      dbg_trace = Log.DebugTrace('stop sync control')
      self.__running_flag = False

      return 0

    def __del__(self):
      self.stop_sync_control()

# debug
if __name__ == '__main__':

  sync_control = SyncControl('00')

  sync_control.run_sync_control()