# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__ = ['AtomSetRunningDataBase']

import threading
from AtomInterface import AtomInterface;

class AtomSetRunningDataBase(AtomInterface):
  def __init__(self):
    AtomInterface.__init__(self);
    db_opt_value = 0

    if None == cmd_param.db_opt:
      return -1

    if None == cmd_param.db_table:
      return -1

    if None == cmd_param.db_sql:
      return -1
    else:
      if cmd_param.db_opt == 'DBS_INSERT':
        db_opt_value = 18
      elif cmd_param.db_opt == 'DBS_DELETE':
        db_opt_value = 9
      elif cmd_param.db_opt == 'DBS_UPDATE':
        db_opt_value = 23
      elif cmd_param.db_opt == 'DBS_SELECT':
        db_opt_value = 21
      else:
        return -1
    result = self.database_handle(cmd_param.cmd_obj, cmd_param.db_table, cmd_param.db_sql, db_opt_value, cmd_param.expect)
    if 0 == result:
      Log.log_report('  ' + cmd_param.cmd_name + ': ' + cmd_param.cmd_cmd + ' SUCCESS')
    else:
      Log.log_report('  ' + cmd_param.cmd_name + ': ' + cmd_param.cmd_cmd + ' FAILURE')


  def Run(self, cmd_param, mesh_device_manager):
    pass