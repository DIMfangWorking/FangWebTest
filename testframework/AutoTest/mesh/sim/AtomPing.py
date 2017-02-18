# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__ = ['AtomPing']

import threading
from logger import getLogger;
from AtomInterface import AtomInterface;

class AtomPing(AtomInterface):
  def __init__(self):
    AtomInterface.__init__(self);
    self.ping_pid = None;
    log_debug('EXEC::CommandPing');
    total = ''
    # ping_ip = '173.'+cmd_param.src_node_id + '.'+ cmd_param.dst_node_id +'.' + '2'
    ping_ip = cmd_param.dst_ip
    Log.log_trace('ping %s' % ping_ip)
    self.ping_pid = subprocess.Popen(['ping', ping_ip, '-s '+str(cmd_param.package_len), '-c '+str(cmd_param.times)],\
                     stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    self.ping_pid.wait()
    (result, err) = self.ping_pid.communicate()
    Log.log_trace(result)
    Log.log_trace(err)

    lines = result.split('\n')
    for line in lines:
      if line.find('packets transmitted') >= 0:
        total += line + ','
      if line.find('rtt') >= 0:
        total += line

    # self.pingPid.kill()
    # os.system('kill -9 ' + str(self.ping_pid.pid))
    # Log.log_trace(total)
    Log.log_report('  ping %s: %s' %(ping_ip, total))

    if total.find(', 0% packet loss') < 0:
      Log.log_report('  ping check: FAILURE')
      return -1
    else:
      Log.log_report('  ping check: SUCCESS')
      return 0

  def Run(self, cmd_param, mesh_device_manager):
    pass;