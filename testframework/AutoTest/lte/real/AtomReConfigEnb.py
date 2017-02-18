# -*- coding:utf-8 -*-
import threading, subprocess
import pdb
import socket,struct,os

import xmltodict, json

from Atom import Atom;
from DbManager import *;
from LMTInterface import RemoteRequest;

class AtomReConfigEnb(Atom):
  def __init__(self, item, case):
    Atom.__init__(self,item, case)
    self.case = case;
    self.testMng = case.group.testMng;
    self.mng = self.case.group.GetEnb('src_enb');
    self.dbOption = [];

    try:
      # self.option = self.subInfo['Option'];
      pass;
    except AttributeError as err:
      print('cfg loaded version error');
      print(err);
      return None;

    # self.option = json.loads(self.option);
    self.enbIp = self.mng.enbIp;

    self.dbm = DBOption(self.testMng, self.mng);

  def Run(self):
    if 'Delay' in  self.subInfo:
      print('Delay  ' + self.subInfo['Delay']);
      threading.Event().wait(int(self.subInfo['Delay']));

    lmt = RemoteRequest('17.31.16.230', '80');
    lmt.uploadWBS();

    hexIpInt = int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0]));
    hexIpGw = (hexIpInt & 0xffffff00) | 0xfe;
    hexIp = '%x' %hexIpInt;
    hexIpGw = '%x' %hexIpGw;
    ipv4 = self.dbm.getTable('T_IPV4');
    ipv4.overwrite({'u8IPID' : 1}, {'u8IPID' : 1, 'U8PortID' : 1, 'U8PortID' : 1, 'u8VlanIndex' : 0, 'au8IPAddr' : hexIp,
        'au8NetMask' : 'ffffff00', 'au8GWAddr' : hexIpGw});

    hexIp = '%x' %int(socket.ntohl(struct.unpack('I',self.testMng.epcip)[0]));
    sctp = self.dbm.getTable('T_SCTP');
    sctp.update({'u16AssID' : 1}, {'u8SrcIPID1' : 1, 'u8SrcIPID2' : 0, 'u8SrcIPID3' : 0, 'u8SrcIPID4' : 0,
        'au8DstIP1' : hexIp, 'au8DstIP2' : '00000000', 'au8DstIP3' : '00000000', 'au8DstIP4' : '00000000',
        'u16RemotPort': 36412, 'u16LocPort': 36412, 'u8InOutStream' : 2, 'u8ManualOP' : 0});

    omc = self.dbm.getTable('T_OMC');
    omc.update({'u8OmcID' : 1}, {'u8eNBIPID' : 1, 'au8OmcServerIP' : hexIp, 'u16SrcPort' : 4999,
        'u16DstPort' : 4999, 'u8Qos' : 5});

    enbpara = self.dbm.getTable('T_ENB_PARA');
    enbpara.overwrite({'u32eNBId' : 4253}, { 'u32eNBId' : int(self.mng.enbId), 'au8eNBName' : self.mng.enbName,
        'au8EEA' : '000000', 'au8EIA' : '000000', 'u8PageDrxCyc' : 2, 'u16EndTmpRNTI' : '10000', 'u8PttEnable' : 1,
        'u8NeedPeerPttCfgRsp' : 1, 'u8UserInactTimer': 19, 'u8PttMode' : 0, 'u8CapsSwitch' : 0 });

    cellpara = self.dbm.getTable('T_CEL_PARA');
    cellpara.update({'u8CId' : 252 }, {'u16PhyCellId' : self.mng.phyCellId, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
    cellpara.update({'u8CId' : 253 }, {'u16PhyCellId' : self.mng.phyCellId1, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});
    cellpara.update({'u8CId' : 254 }, {'u16PhyCellId' : self.mng.phyCellId2, "u8FreqBandInd": 38, "u32CenterFreq":38050, "u8SysBandWidth":5});

    cellpara = self.dbm.getTable('T_SYS_PARA');
    cellpara.update({'u8Indx' : 0 }, {'u8ServeMod' : 1});

    celldlpc = self.dbm.getTable('T_CEL_DLPC');
    celldlpc.update({'u8CId' : 252 }, {'u16CellTransPwr' : 257});
    celldlpc.update({'u8CId' : 253 }, {'u16CellTransPwr' : 257});
    celldlpc.update({'u8CId' : 254 }, {'u16CellTransPwr' : 257});

    threading.Event().wait(5);

    lmt.rebootBBU();

    return True;

  def MsgCheck(self, msg,addr):
    return True

  def Clear(self):
    pass;