# -*- coding:utf-8 -*-

__author__ = 'user'

import os
import subprocess

import GlobalVar
import Log
import DataBaseManager as DBM

__debug_flag = False

def log_debug(info):
    global __debug_flag
    if __debug_flag:
        Log.log_trace(info, Log.DEBUG_LEVEL)

class UserIP:
    def __init__(self, ip_addr, netmask):
        self.ip_addr = ip_addr
        self.netmask = netmask
        log_debug('Create User IP')


    def __get_hex(self, item):
        sub_ip = item.split('.')
        hex_ip = 'X\''
        if len(sub_ip) != 4:
            Log.log_trace('ip format error: ' + item, Log.ERROR_LEVEL)
            return None
        for item in sub_ip:
            tmp = int(item)
            if tmp > 255:
                return None
            if tmp < 16:
                hex_ip = hex_ip +'0'+ str(hex(tmp))
            else:
                hex_ip = hex_ip + str(hex(tmp))
        hex_ip = hex_ip+'\''
        hex_ip = hex_ip.replace('0x','')

        return hex_ip

    #
    def get_hex_ip_addr(self):
        return self.__get_hex(self.ip_addr)


    def get_hex_netmask(self):
        return self.__get_hex(self.netmask)

class MeshDeviceManager:
    def __init__(self, mesh_device_list, mesh_topo):
        self.mesh_devices = mesh_device_list
        self.mesh_topo = mesh_topo
        self.mesh_sync_assist = None

    # run_test mesh_app
    def run_mesh_device(self, device_name):
        for mesh_device in self.mesh_devices:
            if device_name == mesh_device.device_name:
                if mesh_device.is_running():
                    return 0
                else:
                    return mesh_device.run(GlobalVar.get_instance().get_ci_agent_name()[-2:],
                                           self.mesh_topo.get_topo_id())

    # run_test all mesh_app
    def run_all_mesh_device(self):
        for mesh_device in self.mesh_devices:
            if mesh_device.is_running():
                pass
            else:
                if 0 != mesh_device.run_test(GlobalVar.get_instance().get_ci_agent_name()[15:],
                                        self.mesh_topo.get_topo_id()):
                    return -1

        return 0

    # stop mesh_app
    def kill_mesh_device(self, device_name):
        for mesh_device in self.mesh_devices:
            if device_name == mesh_device.device_name:
                if mesh_device.is_running():
                    mesh_device.kill()
                else:
                    pass

    # stop all mesh_app
    def kill_all_mesh_device(self):
        for mesh_device in self.mesh_devices:
            if mesh_device.is_running():
                mesh_device.kill()
            else:
                pass

class NbrNodeRelation:
    def __init__(self, node_id):
        self.node_id
        self.nbr_node_list = []

    def add_nbr_node(self, nbr_node_id):
        if None == self.nbr_node_list.__contains__(nbr_node_id):
            self.nbr_node_list.append(nbr_node_id)

    def update_nbr_nodes(self, nbr_node_list):
        self.nbr_node_list = nbr_node_list