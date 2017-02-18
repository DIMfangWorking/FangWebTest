# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__ = ['AtomDelNode']

import pdb
import threading
from AtomInterface import AtomInterface

class AtomDelNode(AtomInterface):
    def __init__(self):
        AtomInterface.__init__(self)
        for mesh_device in mesh_device_manager.mesh_devices:
            for node in mesh_device.mesh_nodes:
                if cmd_param.cmd_obj == node.node_id:
                    if mesh_device.is_running():
                        log_debug('mesh_device: ' + mesh_device.device_name + ' is running')
                        mesh_device_manager.kill_mesh_device(mesh_device.device_name)
                    else:
                        pass

                    # self.exec_db(mesh_device.db_filename, )
        return 0

    #
    def run(self, cmd_param, mesh_device_manager):
        pass;