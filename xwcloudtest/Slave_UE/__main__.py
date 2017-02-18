#! python -u 
__version__ = "0.1"
__author__ = "guowei"

import os, sys, traceback
import threading
import time
import ast;

import GlobalShare;
from UE import *;

import XWCloudServer
import WebModel

import XWMultiUEServer
import MultiUEModel

def startMultiUEServer(config):
  def process():
    multiUE = config['MultiUE'];
    serveraddr = (multiUE['host'], int(multiUE['port']));
    server = XWMultiUEServer.XWMultiUEServer(serveraddr);
    server.process(MultiUEModel.UEOption);
    print "Serving UDP on", serveraddr[0], "port", serveraddr[1], "...";
    server.serve_forever();

  t = threading.Thread(target=process);
  t.start();
  return t;

def startWEBServer(config):
  def process():
    web = config['WebServer'];
    serveraddr = (web['host'], int(web['port']));
    server = XWCloudServer.XWCloudServer(serveraddr);
    server.process("/UE/Online", WebModel.OnlineOption);
    server.process("/UE/Offline", WebModel.OfflineOption);
    server.process("/UE/Option", WebModel.AtomOption);
    server.process("/UE/OptionResult", WebModel.AtomOptionResult);
    print "Serving HTTP on", serveraddr[0], "port", serveraddr[1], "...";
    server.serve_forever();

  t = threading.Thread(target=process);
  t.start();
  return t;

def parseConf():
  import ConfigParser

  result = {};

  config = ConfigParser.RawConfigParser();
  config.read('Slave_UE.cfg');
  sections = config.sections();
  for section in sections:
    result[section] = {};
    options = config.options(section);
    for option in options:
      result[section][option] = config.get(section, option);

  GlobalShare.getShareObj()['config'] = result;

  return result;

if __name__ == '__main__':
  try:
    config = parseConf();

    mueThread = startMultiUEServer(config);

    webThread = startWEBServer(config);

    sys.stdin = os.fdopen(sys.stdin.fileno(),'r', 0);

    print sys.stdin.read(1);
    while True:
      try :
        cmd = raw_input("");
        for k in UE.UEDict:
          print "UE " + str(UE.UEDict[k]);
        
        #eval(cmd, globals(), locals());
      except KeyboardInterrupt:
        print '^C received, shutting down server';
        os._exit(0);
      except :
        traceback.print_exc(file=sys.stdout);
  except:
    traceback.print_exc(file=sys.stdout);
    os._exit(-1);
  sys.exit(-1);