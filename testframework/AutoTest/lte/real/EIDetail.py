# -*- coding: utf-8 -*- 
__all__ = ['EIDetailSave']

import os;
import datetime;

import json;
import struct;

class EIDetailInfo(object):
  class VarInfo(object):
    def __init__(self, struct, offset):
      '''
      typedef struct _T_VarInfo
      {
        char  strVarName[47];
        B8  b8Signed;
        U16 u16Offset;
        U16 u16Len; 
      }T_VarInfo;
      '''
      self.strVarName = str(struct['name']);
      self.u16Offset= offset;
      t = str(struct['type']);

      length = 0;
      signed = 0;
      if t == 'U64':
        length = 8;
      elif t == 'S64':
        length = 8;
        signed = 1;
      elif t == 'U32':
        length = 4;
      elif t == 'S32':
        length = 4;
        signed = 1;
      elif t == 'U16':
        length = 2;
      elif t == 'S16':
        length = 2;
        signed = 1;
      elif t == 'U8':
        length = 1;
      elif t == 'S8':
        length = 1;
        signed = 1;
      elif t == 'B8':
        length = 1;

      self.u16Len = length;
      self.b8Signed = signed;

    def getFlow(self):
      flow = struct.pack('47sB2H', self.strVarName, self.b8Signed, self.u16Offset, self.u16Len);
      return flow;

  class TLV(object):
    def __init__(self, tlv, conf):
      '''
      typedef struct _T_TlvInfo
      {
        U32  u32TlvId;
        char strTlvName[46];
        U16  u16VarNum;
        T_VarInfo atVarInfo[_MAX_VAR_IN_STRUCT_];
      }T_TlvInfo;
      '''
      self.u32TlvId = int(tlv['id'])
      self.strTlvName = str(conf['Tlv'][str(self.u32TlvId)]['name']);
      structName = conf['Tlv'][str(self.u32TlvId)]['struct'];

      num, varinfo = self._processVar(conf['Struct'][structName]);
      
      self.u16VarNum = num;
      self.atVarInfo = varinfo;

    def _processVar(self, struct):
      length = 0;
      varList = [];
      for item in struct:
        varinfo = EIDetailInfo.VarInfo(item, length);
        length += varinfo.u16Len;
        varList.append(varinfo);
      return len(varList), varList;

    def getFlow(self):
      flow = struct.pack("I46sH", self.u32TlvId, self.strTlvName, self.u16VarNum);
      for item in self.atVarInfo:
        flow += item.getFlow();

      return flow;

  def __init__(self, msg, conf):
    self.tlv = msg['Tlv'];
    self.conf = conf;
    '''
    typedef struct _T_EiMsgInfo
    {
      U32  u32MsgId;
      char strMsgName[64];
      U16  u16DspId;
      U16  u16CoreId;
      U16  u16CellNum;
      U8   au8CellId[3];
      U8   u8Rsv;
      U16  u16UeNum;
      U16  au16UEGId[40];
      U16  u16TagNum;
      U16  u16Resv;
      T_TlvInfo atTlvInfo[100];
    }T_EiMsgInfo;
    '''
    self.u32MsgId = msg['MsgId'];
    self.strMsgName = str(conf[str(self.u32MsgId)]['name']);
    self.u16DspId = int(conf[str(self.u32MsgId)]['DspId']);
    self.u16CoreId = int(conf[str(self.u32MsgId)]['CoreId']);
    self.u16CellNum = 0;
    self.au8CellId = [0, 0, 0];
    self.u8Rsv = 0;
    self.u16UeNum = 0;
    self.au16UEGId = (0,) * 40;

    u16TagNum, tlv = self._processTlv();

    self.u16TagNum = u16TagNum;
    self.atTlvInfo = tlv;

  def _processTlv(self):
    count = 0;
    tlv = [];
    for item in self.tlv:
      count += 1;
      tlv.append(EIDetailInfo.TLV(item, self.conf[str(self.u32MsgId)]));

    return count, tlv;

  def getFlow(self):
    flow = struct.pack('I64s2H', self.u32MsgId, self.strMsgName, self.u16DspId, 
      self.u16CoreId);

    flow += struct.pack('H4B', self.u16CellNum, self.au8CellId[0], self.au8CellId[1],
      self.au8CellId[2], self.u8Rsv)

    flow += struct.pack('H', self.u16UeNum)
    for i in range(40):
      flow += struct.pack('H', self.au16UEGId[i]);
    
    flow += struct.pack('2H', self.u16TagNum, 0);

    for item in self.atTlvInfo:
      flow += item.getFlow();

    return flow;

class EIDetailSave(object):
  def __init__(self, outpath):
    self.__eiDetailFileNo = { };

    self.__eiconfig = json.load(open('ei.json', 'r'));
    # print json.dumps(self.__eiconfig, indent = 4);
    self.outpath = outpath;

  def _createFile(self, id):
    template = self.__eiDetailFileNo[id]['template'];
    filename = template + datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S') + '.ei';
    fd = open(filename, 'wb');

    data = self.__eiDetailFileNo[id]['info'].getFlow();

    if len(data) == 0:
      raise Exception("file head len is 0");

    totalLength = 12 + len(data);
    '''
    U32 u32FileType = 0xAFAFAFAF;
    U32 u32FileLen = 12;
    U32 u32FileRecordNum = 0;
    '''
    fd.write(struct.pack("III", 0xAFAFAFAF, totalLength, 0));

    fd.write(data);
    fd.flush();

    self.__eiDetailFileNo[id]['no'] = fd;
    self.__eiDetailFileNo[id]['name'] = filename;
    self.__eiDetailFileNo[id]['filelen'] = totalLength;

  def setMsg(self, id):
    msgId = id['MsgId'];
    eiDetailInfo = EIDetailInfo(id, self.__eiconfig);

    self.__eiDetailFileNo[msgId] = { };
    template = self.outpath + self.__eiconfig[str(msgId)]['name'] + '_';

    self.__eiDetailFileNo[msgId] = { 'template' : template, 'num' : 0 , 'info' : eiDetailInfo};
    self._createFile(msgId);

  def write(self, id, data):
    (eiMsg, ariTime, sn, num, length) = id;

    fd = self.__eiDetailFileNo[eiMsg]['no'];

    self.__eiDetailFileNo[eiMsg]['num'] += 1;
    self.__eiDetailFileNo[eiMsg]['filelen'] += 16 + len(data) ;

    if self.__eiDetailFileNo[eiMsg]['filelen'] >= 5000000 :
      fd.close();
      self._createFile(eiMsg);
      fd = self.__eiDetailFileNo[eiMsg]['no'];
      self.__eiDetailFileNo[eiMsg]['num'] = 1;
      self.__eiDetailFileNo[eiMsg]['filelen'] += 16 + len(data) ;

    fd.seek(0, os.SEEK_SET);
    fd.write(struct.pack("III", 0xAFAFAFAF, self.__eiDetailFileNo[eiMsg]['filelen'], self.__eiDetailFileNo[eiMsg]['num']));

    fd.seek(0, os.SEEK_END);

    fd.write(datetime.datetime.utcnow().strftime('%H:%M:%S:%f')[:-3]);
    fd.write(struct.pack("I",0));
    fd.write(data);
    fd.flush();

if __name__ == '__main__':
  EIDetailSave('./')
