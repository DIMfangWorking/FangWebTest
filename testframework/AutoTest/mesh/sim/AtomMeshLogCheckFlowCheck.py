# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['AtomMeshLogCheckFlowCheck']

import threading;
from AtomInterface import AtomInterface;

class AtomMeshLogCheckFlowCheck(AtomInterface):
    def __init__(self):
        AtomInterface.__init__(self)
        log_debug('EXEC::CommandMeshLogCheckFlowCheck')
        for device in mesh_device_manager.mesh_devices:
            for node in device.mesh_nodes:
                if cmd_param.cmd_obj == node.node_id:
                    device.log_check_list.append({'object':cmd_param.cmd_obj, 'title':cmd_param.title, 'step_list':cmd_param.step_list})

    def Run(self, cmd_param, mesh_device_manager):
    	pass;