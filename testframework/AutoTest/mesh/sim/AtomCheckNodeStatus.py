# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['AtomCheckNodeStatus']

import threading;
from AtomInterface import AtomInterface;

class AtomCheckNodeStatus(AtomInterface):
  def __init__(self):
    AtomInterface.__init__(self)
    log_debug('EXEC::CommandCheckNodeStatus')
    cmd_param.db_table = 'T_NODE_PARA'
    for mesh_device in mesh_device_manager.mesh_devices:
      for node in mesh_device.mesh_nodes:
        if node.node_id == cmd_param.cmd_obj:
          cmd_param.db_sql = 'select Status from T_NODE_PARA where NodeId=' + cmd_param.cmd_obj
          cmd_param.cmd_obj = mesh_device.device_name
    db_opt_value = 21

    result = self.database_handle(cmd_param.cmd_obj, cmd_param.db_table, cmd_param.db_sql, db_opt_value, cmd_param.expect)
    if 0 == result:
      Log.log_report('  checkpoint: ' + cmd_param.cmd_cmd + ' ' + cmd_param.cmd_obj + ' SUCCESS')
    else:
      Log.log_report('  checkpoint: ' + cmd_param.cmd_cmd + ' ' + cmd_param.cmd_obj + ' FAILURE')

  def execute(self, cmd_param, mesh_device_manager):
    pass;
