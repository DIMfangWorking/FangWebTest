# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['MeshDevice'];

import os;
import sys;
import subprocess;

from logger import getLogger;

logger = getLogger();

# class mesh topo
class MeshTopo:
  def __init__(self, name):
    self.__name = name
    self.__nbr_node_rel_list = []
    Log.log_trace('Mesh Topo Name: ' + self.__name)

  def add_nbr_node_rel(self, nbr_node_rel):
    if None != nbr_node_rel:
      self.__nbr_node_rel_list.append(nbr_node_rel)

  def get_topo_id(self):
    if self.__name == 'grid':
      return 0
    elif self.__name == 'line':
      return 1
    elif self.__name == 'star':
      return 2
    elif self.__name == 'hrbd':
      return 3
    elif self.__name == 'ring':
      return 4
    elif self.__name == 'max':
      return 5

  def to_string(self):
    return self.__name

class MeshNode(object):
  def __init__(self, node_inid, node_id):
    self.node_inid = node_inid;
    self.node_id = node_id;
    self.device_instance = None;
    logger.debug('Create Mesh Node');

class MeshDevice(object):
  def __init__(self, deviceManager, name, id, nodeId, ip, mask = '255.255.255.0'):
    logger.debug('Create Mesh Device %s(%d)' % (name, id));

    self.mesh_nodes = MeshNode(id, nodeId);
    self.device_name = name;
    self.device_ip = ip;
    self.db_filename = 'mesh%d.db' %id;
    self.log_filename = '';
    self.log_filename_for_test_case = None;
    self.stdout_fd = None;
    self.stderr_fd = None;
    self.run_flag = False;
    self.device_process = None;
    self.tcpdump_process = None;
    self.log_check_list = [];

  # 设置DB文件内容
  def set_database(self):
    logger.debug('set_database %r' % self.testMng);

    # 初始化DB文件
    # old_path = os.getcwd();
    # os.chdir(self.testMng.enbpath);
    # if os.path.exists(self.db_filename):
    #   os.system('rm -rf ' + self.db_filename);

    # os.system('cp ./mesh_db_pico/' + self.db_filename + ' ' + self.db_filename);

    # # db_manager = DBM.DataBaseManager(self.db_filename);

    # # 更新DB
    # table = ''
    # field = ''
    # value = ''
    # whereas = ''

    # # T_IPV4
    # table = 'T_IPV4'
    # field = 'IPAddr'
    # value = self.device_ip[0].get_hex_ip_addr()
    # if None != value:
    #   db_manager.add_update_command(table, field, value)
    # else:
    #   os.chdir(old_path)
    #   return -1

    # field = 'NetMask'
    # value = self.device_ip[0].get_hex_netmask()
    # if None != value:
    #   db_manager.add_update_command(table, field, value)
    # else:
    #   os.chdir(old_path)
    #   return -1

    # if 0 != db_manager.execute_command():
    #   Log.log_trace('DB::execute_command fail', Log.ERROR_LEVEL)
    #   os.chdir(old_path)
    #   return -1

    # os.chdir(old_path)

    return 0

  # is running
  def is_running(self):
    return None != self.device_process

  # run_test mesh_app
  def run(self):
    result = -1
    logger.info('run_test mesh device:' + self.device_name)

    if 0 != self.set_database():
      return -1

    # exec_path = 'output/mesh_app'
    # exec_cmd = []
    # exec_cmd.append(exec_path)
    # # exec_cmd.append(agent_name)
    # # exec_cmd.append(str(topo_id))
    # exec_cmd.append(self.device_name[-1:])
    # exec_cmd.append(self.db_filename)
    # stdout_name = GlobalVar.get_instance().get_test_log_path() + \
    #         GlobalVar.get_instance().get_ci_agent_name() + '_' + \
    #         GlobalVar.get_instance().get_ci_agent_build_num() +\
    #         '_stdout_' + self.device_name + '.log'
    # stderr_name = GlobalVar.get_instance().get_test_log_path() + \
    #         GlobalVar.get_instance().get_ci_agent_name() + '_' + \
    #         GlobalVar.get_instance().get_ci_agent_build_num() + \
    #         '_stderr_' + self.device_name + '.log'
    # self.log_filename = stdout_name
    # self.stdout_fd = open(stdout_name, 'w+')
    # self.stderr_fd = open(stderr_name, 'w+')
    # process = subprocess.Popen(exec_cmd, cwd = GlobalVar.get_instance().get_mesh_code_path() + '/output/',
    #                stdout=self.stdout_fd.fileno(), stderr=self.stderr_fd.fileno())
    # self.device_process = process
    # Log.log_trace(exec_cmd)

    return 0

  # kill mesh_app
  def kill(self):
    os.system('kill -9 ' + str(self.device_process.pid))
    self.device_process = None

    return 0

  def start_tcpdump(self):
    pass
    # cmd = 'tcpdump -i '+syscfg.ETH_ID+':'+ self.eNBId+' -w ../log/tcpdump_enb'+ self.eNBId + globalvar.g_ci_agent_name+'_'+globalvar.g_ci_agent_build_num
    # self.tcpdump_process = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,shell=True)
    # check_dict = {}

  # log 检查
  def mesh_log_check(self):
    line_index = 0
    if None != self.log_filename_for_test_case:
      file = open(self.log_filename_for_test_case, 'r')
    else:
      Log.log_report('  logcheck Failue: log check fail!')
      return -1

    result = False
    # log_debug('self.log_check_list: ' + self.log_check_list)
    for check_item in self.log_check_list:
      step_list = check_item.get('step_list')
      for step in step_list:
        result = False
        file.seek(line_index)
        for line in file:
          line_index = line_index + 1
          if not line.find(step)==-1:
            result = True
            #else:
            #print 'Not Found' + logcheckitem

        if False == result:
          Log.log_report('  logcheck Failue:' + check_item.get('object') + check_item.get('title') + \
                   'can not find' + step)
          file.close()
          return -1
      Log.log_report('  logcheck :' + check_item.get('title') + '  ' + check_item.get('object'))
      Log.log_report('  logcheck : SUCCESS')

    file.close()

    return 0

  def stop(self):
    self.clear();

  #
  def clear(self):
    if None != self.stdout_fd:
      self.stdout_fd.close()
    if None != self.stderr_fd:
      self.stderr_fd.close()

    if self.is_running():
      os.system('kill -9 '+ str(self.device_process.pid))

    if None != self.tcpdump_process:
      os.system('kill -9 '+ str(self.tcpdump_process.pid))

  #
  def __del__(self):
    self.clear()