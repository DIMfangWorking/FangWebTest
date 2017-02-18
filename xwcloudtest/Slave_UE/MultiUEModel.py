__version__ = "0.1"
__all__ = ["UEOption"]
__author__ = "guowei"

#echo -n -e "\xAA\xFF\x00\x01\x00\x00\x00\x01\x01\x12\x34\x56\x78\x9a\xbc\xed\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x10\x10\x10\x10" | nc -w10 -u  172.31.4.39 2180

import struct;
import socket;
import string;

from UE import UE;
from XWMultiUEServer import Resource;

UeVersion = {}
CurrentProocessUE = {}

class UEOption(Resource):
  seqnum = 0;

  EV_LINK_REQ_MSG = 1;
  EV_LINK_REQ_ACK_MSG = 2;
  EV_HEART_BEAT_MSG = 3;
  EV_HEART_BEAT_ACK_MSG = 4;
  EV_CTRL_CMD_MSG = 5;
  EV_CTRL_CMD_ACK_MSG = 6;
  EV_EXTEND_INFO_REPORT_MSG = 7;

  Extend_Info_Type_CellInfo = 0;

  def __structHeadDL__(self, commandID, length):
    UEOption.seqnum += 1;
    '''
    U16 u16MsgId;
    U16 u16MsgLen; 
    U32 u32SeqNum;
    '''
    flow = struct.pack("!2HI", commandID, length, UEOption.seqnum);
    return flow;

  def do_1(self):
    # echo -n -e '\x00\x01\x00\x01\x00\x00\x00\x01\x12\x34\x56\x78\x90\x12\x34\x56\x00\x00\x04\x1f' | nc -u 172.31.4.46 49158
    IMSI = self.request.IMSI;
    '''
    S32 s32Version
    '''
    if len(self.request.data) >= 4:
      (s32Version,) = struct.unpack('!I', self.request.data[:4]);
      UeVersion[IMSI] = s32Version;

    if self.request.IMSI in UE.UEDict:
      UE.UEDict[self.request.IMSI].heartbeat();
      UE.UEDict[self.request.IMSI].setVersion(s32Version);

    flow = self.__structHeadDL__(self.EV_LINK_REQ_ACK_MSG, 0);
    self.request.socket.sendto(flow, self.request.client);

  def do_3(self):
    # echo -n -e '\x00\x03\x00\x0c\x00\x00\x00\x01\x12\x34\x56\x78\x90\x12\x34\x56\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x00\x02' | nc -u 172.31.4.46 49158

    '''
    S16 s16RSRP; 
    U16 u16Reserved;
    U32 u32ULThrput;
    U32 u32DLThrput;
    '''
    (s16RSRP, u16Reserved, u32ULThrput, u32DLThrput) = struct.unpack("!hH2I", self.request.data[:12]);

    if self.request.IMSI in UE.UEDict:
      UE.UEDict[self.request.IMSI].notifyThr(s16RSRP, u32ULThrput, u32DLThrput);

      UE.UEDict[self.request.IMSI].heartbeat();

      flow = self.__structHeadDL__(UEOption.EV_HEART_BEAT_ACK_MSG, 0);
    else:
      if self.request.IMSI in CurrentProocessUE:
        flow = self.__structHeadDL__(UEOption.EV_HEART_BEAT_ACK_MSG, 0);
      else:
        flow = self.__structHeadDL__(self.EV_LINK_REQ_ACK_MSG, 0);

    self.request.socket.sendto(flow, self.request.client);

  def do_6(self):
    # echo -n -e '\x00\x06\x00\x01\x00\x00\x00\x01\x12\x34\x56\x78\x90\x12\x34\x56' | nc -u 172.31.4.46 49158
    IMSI = self.request.IMSI;

    if self.request.IMSI in UE.UEDict:
      UE.UEDict[self.request.IMSI].heartbeat();
      UE.UEDict[self.request.IMSI].checkCmd(self.request.seqnum);

  def do_7(self):
    # echo -n -e '\x00\x07\x00\x08\x00\x00\x00\x01\x12\x34\x56\x78\x90\x12\x34\x56\x00\x00\x01\x23\x00\x00\x86\x01' | nc -u 172.31.4.46 49158

    '''
    byte u8Type;
    byte u8Resvered;
    UInt16 u16PCI;
    UInt32 u32ECGI;
    '''
    (u8Type, u8Resvered, u16PCI, u32ECGI) = struct.unpack("!2BHI", self.request.data[:8]);

    if UEOption.Extend_Info_Type_CellInfo == u8Type:
      u32EnbId = (u32ECGI & 0xffffff00) >> 8;
      u32CI = u32ECGI & 0xff;

      if self.request.IMSI in CurrentProocessUE:
        pass;
      else:
        CurrentProocessUE[self.request.IMSI] = 1;
        if self.request.IMSI in UeVersion:
          if self.request.IMSI in UE.UEDict:
            UE.UEDict[self.request.IMSI].chooseCell(u32EnbId, u32CI, u16PCI);
          else:
            UE(self.request.IMSI, u32EnbId, u32CI, u16PCI, self.request.socket,
                self.request.client, UeVersion[self.request.IMSI]);
        del CurrentProocessUE[self.request.IMSI];