#! /usr/bin/python

import os;
import sys;

import httplib, urllib;
import xml.etree.ElementTree as ET;

from ftplib import FTP;

import telnetlib;
import time;
import re;

from threading import *;

from serial import *;
import xmltodict;

import VersionConfigParser;

total = 0;

def progress(data):
	global total;
	total = total + len(data);
	#print total;
	return data;

class RemoteRequest:
  def __init__(self, host, port, version = None, cfg = None):
    self.cwd = os.path.dirname(__file__);
    self.host = host;
    self.port = port;
    self.version = version;
    self.cfg = cfg;

    self.binFile = ['lteBtsXml', 'clickActiveXml', 'restartXml'];

    self.__uploadBinFile__();
    self.__chmodBinFile__();

  def __ftp_login__(self):
    ftp = FTP(self.host);
    try :
      ftp.login('root', '12345678');
    except:
      ftp.login();
    return ftp;

  def __uploadBinFile__(self):
    ftp = self.__ftp_login__();
    
    ftp.cwd('/mnt/WBS/web/cgi-bin');
    for item in self.binFile:
      cgiName = self.cwd + os.sep + 'lmt' + os.sep + 'cgi' + os.sep + item;
      try:
        ftp.delete(item);
      except:
        pass;

      ftp.storbinary('STOR ' + item, open(cgiName, 'rb'));
    
    if self.cfg :
      print 'upload ' + self.cfg
      ftp.cwd('/mnt/WBS/web/');
      ftp.storbinary('STOR ' + self.cfg, open(self.cfg, 'rb'));
      print 'upload ' + self.cfg + ' complete'
    ftp.quit()

    ftp = self.__ftp_login__();
    if self.version :
      print 'upload ' + self.version
      ftp.cwd('/mnt/WBS/web/');
      ftp.storbinary('STOR ' + self.version, open(self.version, 'rb'), callback = progress);
      print 'upload ' + self.version + ' complete'

    ftp.quit()

  def __chmodBinFile__(self):
    tn = telnetlib.Telnet(self.host);
    tn.read_until("(none) login: ", 5);
    tn.write("root\n");

    tn.read_until("Password: ", 5);
    tn.write("12345678\n");

    tn.read_until("#", 5);
    tn.write("cd /mnt/WBS/web/cgi-bin\n");

    for item in self.binFile:
      tn.write("chmod a+x /mnt/WBS/web/cgi-bin/" + item + '\n');
      tn.read_until("#", 5);

    if self.version :
      tn.write("chmod a+rwx /mnt/WBS/web/" + self.version + '\n');
      tn.write("printf " + self.version + " > /mnt/WBS/web/upload_file_info/fileInfo.txt \n");
      tn.read_until("#", 5);

    if self.cfg :
      tn.write("printf " + self.cfg + " > /mnt/WBS/web/upload_file_info/cfgFileInfo.txt \n");
      tn.read_until("#", 5);
      
    tn.write('exit');
    tn.close();

  def __getData__(self, params):
    conn = httplib.HTTPConnection(self.host, self.port);
    conn.request("POST", "/cgi-bin/lteBtsXml", params, {"Content-type": "application/json"});
    response = conn.getresponse();

    #if response.status == 200 :
    data = response.read();

    conn.close();

    return data;

  def __parseResponse__(self, data):
    result = {};
    result['result'] = -1;
    result['message'] = 'not found result element';
    setResult = False;

    elm = ET.fromstring(str(data));
    try :
      for item in elm:
        name = item.tag;
        if name == 'result' :
          setResult = True;
          result['result'] = int(item.text);
        elif name == 'message' :
          setResult = True;
          result['message'] = item.text;
        elif name == 'list' :
          setResult = True;
          result['name'] = item.attrib['name'];
          count = int(item.attrib['count']);
          result[item.attrib['name']] = [];
          for key in item.getchildren() :
            obj = {};
            for i in key :
              obj[i.attrib['name']] = i.attrib['value'];
            result[item.attrib['name']].append(obj);
          result[item.attrib['name']] = result[item.attrib['name']][:count]
    except:
      print data
      result['message'] =  sys.exc_info().__str__;
      return result;

    if setResult == False:
      print data

    return result,setResult;

  def insert(self, table, **params):
    return self.insertDict(table, params);

  def insertDict(self, table, params):
    # operationType=insert&tableName=t_board&target=sql&u8RackNO=4&u8ShelfNO=1&u8SlotNO=17&u8BDType=1&u8RadioMode=1&u8ManualOP=0
    # print 'insert'
    urlParams = {'operationType': 'insert', 'target': 'sql', 'tableName': table}
    params = urllib.urlencode(dict(urlParams.items() + params.items()));
    data = self.__getData__(params);
    result, flag = self.__parseResponse__(data);
    if flag == False:
      print params
    return result

  def delete(self, table, **params):
    return self.deleteDict(table. params);

  def deleteDict(self, table, params):
    # operationType=delete&target=single&tableName=t_ipv4&u8IPID=1
    # print 'delete'
    urlParams = {'operationType': 'delete', 'target': 'single', 'tableName': table}
    params = urllib.urlencode(dict(urlParams.items() + params.items()));
    data = self.__getData__(params);
    result, flag = self.__parseResponse__(data);
    if flag == False:
      print params
    return result;

  def update(self, table, **params):
    return self.updateDict(table, params);

  def updateDict(self, table, params):
    # operationType=update&tableName=t_board&target=sql&u8RackNO=2&u8ShelfNO=1&u8SlotNO=1&u8BDType=1&u8RadioMode=1&u8ManualOP=0
    # print 'update'
    urlParams = {'operationType': 'update', 'target': 'sql', 'tableName': table}
    params = urllib.urlencode(dict(urlParams.items() + params.items()));
    data = self.__getData__(params);
    result, flag = self.__parseResponse__(data);
    if flag == False:
      print params

    return result;

  def find(self, table):
    # cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_board
    # print 'find'
    params = urllib.urlencode({'operationType': 'select', 'target': 'query', 'tableName': table});
    try :
      data = self.__getData__(params);
      result, flag = self.__parseResponse__(data);
      return result;
    except:
      print params
      return {'result' : -1, 'message' : 'xml parse error'};

  def findOne(self, table, **cond):
    return self.findOneDict(table, cond);

  def findOneDict(self, table, cond):
    # cgi-bin/lteBts?operationType=select&target=config&tableName=t_cel_para&u8CId=252
    # print 'findOne'
    urlParams = {'operationType': 'select', 'target': 'config', 'tableName': table}
    params = urllib.urlencode(dict(urlParams.items() + cond.items()));
    data = self.__getData__(params);
    
    try :
      result = xmltodict.parse(str(data))['result'];
    
      resultObj = {}
      for key in result.keys():
        if key == 'result' or key == 'message':
          resultObj[key] = result[key];
        else :
          resultObj[key] = {};
          for key1 in result[key]['field']:
            try :
              resultObj[key][key1['@name']] = key1['@value']
            except:
              pass
    
      return resultObj;
    except:
      print params
      print data;
      return {'result' : -1, 'message' : 'xml parse error'};

  def uploadVersion(self, version, cfg = None):
    self.version = os.path.basename(version);
    try :
      if cfg :
        ftp = self.__ftp_login__();
        self.cfg = os.path.basename(cfg);
        print 'upload ' + self.cfg
        ftp.cwd('/mnt/WBS/web/');
        ftp.storbinary('STOR ' + self.cfg, open(cfg, 'rb'));
        print 'upload ' + self.cfg + ' complete'
        ftp.quit()

      ftp = self.__ftp_login__();
      if self.version :
        print 'upload ' + self.version
        ftp.cwd('/mnt/WBS/web/');
        ftp.storbinary('STOR ' + self.version, open(version, 'rb'), callback = progress);
        print 'upload ' + self.version + ' complete'

      ftp.quit()
    except Exception as e:
      print e
      return False;

    return True;

  def active(self):
    print 'active version'

    tn = telnetlib.Telnet(self.host);
    tn.read_until("(none) login: ", 5);
    tn.write("root\n");

    tn.read_until("Password: ", 5);
    tn.write("12345678\n");

    tn.read_until("#", 5);

    version = '\'\'';
    if self.version :
      version = self.version;
    tn.write("chmod a+rwx /mnt/WBS/web/" + self.version + '\n');
    tn.write("printf " + version + " > /mnt/WBS/web/upload_file_info/fileInfo.txt \n");
    tn.read_until("#", 5);

    cfg = '\'\'';
    if self.cfg :
      cfg = self.cfg;
    tn.write("printf " + cfg + " > /mnt/WBS/web/upload_file_info/cfgFileInfo.txt \n");
    tn.read_until("#", 5);
      
    tn.write('exit');
    tn.close();

    if self.version or self.cfg :
      conn = httplib.HTTPConnection(self.host, self.port, timeout=60);
      conn.request("POST", "/cgi-bin/clickActiveXml");
      response = conn.getresponse();

      #if response.status == 200 :
      data = response.read();

      conn.close();

      reslut, flag = self.__parseResponse__(data);
      return reslut;
    else :
      raise Exception('not found version and cfg');

  def getCurrentVersion(self):
    result = self.find('t_swpkg');
    if result['result'] == 0 :
      for item in result['t_swpkg'] :
        if int(item['u8RunStatus']) == 1:
          return item['au8PkgVer'];
    return None;

  def uploadWBS(self):
    file = VersionConfigParser.VersionConfig().getConfig(self.getCurrentVersion())['LMT'];
    filename = os.path.basename(file);

    tn = telnetlib.Telnet(self.host);
    tn.read_until("(none) login: ", 5);
    tn.write("root\n");

    tn.read_until("Password: ", 5);
    tn.write("12345678\n");
    tn.read_until("#", 5);
    tn.write("rm -rf /mnt/%s\n" %filename);
    tn.read_until("#", 5);

    ftp = self.__ftp_login__();
    ftp.cwd('/mnt/');
    ftp.storbinary('STOR %s' %filename, open(file, 'rb'));
    ftp.quit();

    tn.write("cd /mnt/\n");
    tn.read_until("#");
    tn.write("tar -xzvf %s\n" %filename);

    tn.write("cd /mnt/WBS/\n");
    tn.read_until("#");

    tn.write("chmod -R a+rwx /mnt/WBS\n");
    tn.read_until("#");

    tn.write('exit');
    tn.close();

    self.__uploadBinFile__();
    self.__chmodBinFile__();

  def rebootBBU(self):
    print 'reboot BBU'
    tn = telnetlib.Telnet(self.host);
    tn.read_until("(none) login: ", 5);
    tn.write("root\n");

    tn.read_until("Password: ", 5);
    tn.write("12345678\n");
    tn.read_until("#", 5);
    tn.write("reboot\n");
    tn.read_until("#", 5);
    tn.write('exit');
    tn.close();

if __name__ == "__main__" :
  lock = Lock();
  lock.acquire();
  from SerialRead import SerialRead;
  s = SerialRead(sys.stdout, lock);
  s.start();

  rr = RemoteRequest('17.31.16.230', '80', 'McLTE.3.1.1.0.BIN', 'lte.sql');
  print rr.active();

  lock.acquire();

  data = rr.find('t_ipv4');
  print data;

  data = rr.delete('t_ipv4', u8IPID=1);
  print data;

  data = rr.insert('t_ipv4', u8IPID=1,U8PortID=1,u8VlanIndex=0,au8IPAddr='ac1f04de',au8NetMask='ffffff00',au8GWAddr='ac1f04fe');
  print data;

  data = rr.find('t_ipv4');
  print data;

  data = rr.update('t_omc', u8OmcID=1,u8eNBIPID=1,au8OmcServerIP='ac1f04ec',u16SrcPort=4999,u16DstPort=4999,u8Qos=0);
  print data;

  data = rr.find('t_omc');
  print data;

  data = rr.delete('t_enb_para', u32eNBId=4253);
  print data;

  data = rr.insert('t_enb_para', u32eNBId=546,au8eNBName='eNB222',au8EEA='000000',au8EIA='000000',u8PageDrxCyc=2,u16EndTmpRNTI='10000',u8PttEnable=1,u8NeedPeerPttCfgRsp=1,u8UserInactTimer=19,u8PttMode=0,u8CapsSwitch=0);
  print data;

  data = rr.find('t_enb_para');
  print data;

  s.stop();