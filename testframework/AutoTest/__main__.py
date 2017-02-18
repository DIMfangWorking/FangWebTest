#-*- coding:utf-8 -*-
__author__ = 'guowei';

#E:\guow\CloudTest\code\testframework>python AutoTest test --enbip 20.2.100.108 --epcip 20.2.100.102 --enbid 1 --enbname SysTest_2F_1 --slave_ue 172.31.3.237
import socket;
import os;
import sys;
import time;
import json;

import traceback;
import redis;

from logger import getLogger;
from AutoTestCommandArgument import AutoTestCommandArgument;
from manager import Manager;

logger = getLogger();

class OutPut(object):
  def __init__(self, real, host, port = 6379, key = None):
    self.host = socket.inet_ntoa(host);
    self.port = port;
    self.key = key;
    self.redis = redis.StrictRedis(self.host, self.port, db = 0);
    self.real = real;
    self.buf = '';

  def __del__(self):
    self.redis.quit();

  def write(self, *args, **kwargs):
    try :
      self.buf += "%s" %args
      while True :
        pos = self.buf.find('\n');
        if pos >= 0:
          line, self.buf = self.buf[:pos+1], self.buf[pos+1:]
        elif len(self.buf) > 512:
          line, self.buf = self.buf, ''
        else :
          break;
        self.real.write(line);
        
        self.redis.rpush(self.key, json.dumps({"message" : line}));
    except:
      traceback.print_exc(file=self.real);

  def flush(self):
    pass

def setOutput(host,port,key):
  sys.stdout = OutPut(sys.stdout, host, port, key);
  sys.stderr = OutPut(sys.stderr, host, port, key);
  return None;

if __name__ == '__main__' :
    logger.info('test start');

    options = AutoTestCommandArgument().getOption(sys.argv[1:]);

    logger.info('test start args %r', options);
    if 'wait' in options :
        print 'For network setup, please wait a few seconds';
        time.sleep(options['wait']);

    try:
      optionKeys = options.keys();
      if 'redis' in options and 'rport' in options and 'rkey' in options:
        setOutput(options['redis'], options['rport'], options['rkey']);
      else :
        print 'not send output to redis';

      manager = Manager(options);
      manager.Run();
      os._exit(0);
    except:
      traceback.print_exc(file=sys.stdout)
      os._exit(-1);