import struct
import pdb

MSG_CELL_STATUS_CHECK_REQ = 1001
MSG_CELL_STATUS_CHECK_RSP = 1002

MSG_ADD_UE_GROUP_CMD = 2000
MSG_ADD_UE_GROUP_CHECK_REQ = 2001
MSG_ADD_UE_GROUP_CHECK_RSP = 2002

MSG_DEL_UE_GROUP_CMD = 2010
MSG_DEL_UE_GROUP_CHECK_REQ = 2011
MSG_DEL_UE_GROUP_CHECK_RSP = 2012

MSG_PING_CMD = 3000
MSG_PING_CHECK_REQ = 3001
MSG_PING_CHECK_RSP = 3002

MSG_IPERF_CMD = 3010
MSG_IPERF_CHECK_REQ = 3011
MSG_IPERF_CHECK_RSP = 3012

MSG_HAND_OVER_CMD = 4000
MSG_HAND_OVER_CHECK_REQ = 4001
MSG_HAND_OVER_CHECK_RSP = 4002

MSG_REESTABLISHMENT_REQUEST_CMD = 7100
MSG_REESTABLISHMENT_REQUEST_CHECK_REQ = 7101
MSG_REESTABLISHMENT_REQUEST_CHECK_RSP = 7102

MSG_UE_INACTIVE_CHECK_REQ = 7111
MSG_UE_INACTIVE_CHECK_RSP = 7112

MSG_CALL_REQUEST_CMD = 7130
MSG_DATA_SEND_CMD = 7140

MSG_TRUNKING_REG_REQ_CMD  =7150
MSG_TRUNKING_DEREG_REQ_CMD =7160

MSG_FLOOR_REQ_CMD   =7170
MSG_QUEUE_FLOOR_REQ_CMD = 7180
MSG_CALL_RELEASE_CMD=7190

MSG_REPORT_INFO = 5005
MSG_BLER_CHECK_REQ =  5006
MSG_BLER_CHECK_RSP =  5007
MSG_ULBLER_CHECK_REQ  =  5008
MSG_ULBLER_CHECK_RSP  =  5009
MSG_PDNIP = 8006

MSG_DEDICATED_BEARER_SETUP = 9000
MSG_DEDICATED_BEARER_CHECK_REQ = 9001
MSG_DEDICATED_BEARER_CHECK_RSP = 9002

MSG_DEDICATED_BEARER_DEL = 9010
MSG_DEDICATED_BEARER_DEL_CHECK_REQ = 9011
MSG_DEDICATED_BEARER_DEL_CHECK_RSP = 9012

MSG_DELAY = 9900
MSG_DATABASE_CMD = 9911
MSG_100MS_INFORM = 9999
REPORT_DICT={'BLER':1,'RI':2,'CQI':3,'TA':4,'PHR':5,'RSRP':6,'SINR':7}
MSG_NUMBER_TO_NAME={1002:'MSG_CELL_STATUS_CHECK_RSP',2002:'MSG_ADD_UE_GROUP_CHECK_RSP',2012:'MSG_DEL_UE_GROUP_CHECK_RSP',3002:'MSG_PING_CHECK_RSP',4002:'MSG_HAND_OVER_CHECK_RSP',5007:'MSG_BLER_CHECK_RSP',5009:'MSG_ULBLER_CHECK_RSP',7102:'MSG_REESTABLISHMENT_REQUEST_CHECK_RSP',7112:'MSG_UE_INACTIVE_CHECK_RSP',9002:'MSG_DEDICATED_BEARER_CHECK_RSP'}

class Msg:
    def __init__(self):
        self.msgList = [];
        self.msgBuf = [];
        pass;

    def SetMsg(self, msgList = None):
        if None == msgList:
            msgList = self.msgList;

        while len(msgList) < 16:
            msgList.append(0);

        s = struct.Struct('IIIIIIIIIIIIIIII');
        self.msgBuf = s.pack(*msgList);

class CheckMsg(Msg):
    def __init__(self,msgId, ueGrpId = 0):
        Msg.__init__(self);
        self.msgList.append(msgId);
        self.msgList.append(ueGrpId);
        self.SetMsg();
        pass;

class AddUeGrpCmdMsg(Msg):
    def __init__(self, msgId, ueGrpId, ueNum, enbType = 0, attachType = 0, attachNumInOneSubFrm=2):
        Msg.__init__(self);
        self.msgList.append(msgId);
        self.msgList.append(ueGrpId);
        self.msgList.append(ueNum);
        self.msgList.append(enbType);
        self.msgList.append(attachType);
        self.msgList.append(attachNumInOneSubFrm);
        self.SetMsg();
        pass;

class AddUeGrpReqMsg(Msg):
    def __init__(self, msgId, ueGrpId, ueNum):
        Msg.__init__(self);
        self.msgList.append(msgId);
        self.msgList.append(ueGrpId);
        self.msgList.append(ueNum);
        self.SetMsg();

class PdnIpMsg(Msg):
    def __init__(self, ueGrpId, pdnIp, LchNum = 3):
        Msg.__init__(self);
        self.msgList.append(MSG_PDNIP);
        self.msgList.append(ueGrpId);
        self.msgList.append(pdnIp);
        self.msgList.append(LchNum);
        self.SetMsg();
        pass;

class PingCmdMsg(Msg):
    def __init__(self, ueGrpId, pdnIp, pktLen = 32, Times = 10):
        Msg.__init__(self)
        self.msgList.append(MSG_PING_CMD);
        self.msgList.append(ueGrpId);
        self.msgList.append(pdnIp);
        self.msgList.append(pktLen);
        self.msgList.append(Times);
        self.SetMsg();
        pass;

class DelUeGrp(Msg):
    def __init__(self,ueGrpId = 0):
        Msg.__init__(self);
        self.msgList.append(MSG_DEL_UE_GROUP_CMD);
        self.msgList.append(ueGrpId);
        self.SetMsg();
        pass;

class HandOverCmdMsg(Msg):
    def __init__(self, ueGrpId, dstEnb, MeasId):
        Msg.__init__(self);
        self.msgList.append(MSG_HAND_OVER_CMD);
        self.msgList.append(ueGrpId);
        self.msgList.append(dstEnb);
        self.msgList.append(MeasId);
        self.SetMsg();
        pass;

class HandOverReqMsg(CheckMsg):
    def __init__(self, ueGrpId):
        CheckMsg.__init__(self, MSG_HAND_OVER_CHECK_REQ, ueGrpId);
        pass;

class BearSetupCmdMsg(Msg):
    def __init__(self, ueGrpId, qci):
        Msg.__init__(self);
        self.msgList.append(MSG_DEDICATED_BEARER_SETUP);
        self.msgList.append(ueGrpId);
        self.msgList.append(qci);
        self.SetMsg();
        pass;

class CheckBearSetupReqMsg(CheckMsg):
    def __init__(self, ueGrpId):
        CheckMsg.__init__(self, MSG_DEDICATED_BEARER_CHECK_REQ, ueGrpId);
        pass;

def DbsExeReqMsg(file, table, sql, patton, hdlnum = 0, ctx = 6):
    fmt = '4H24s480sB3000sBI';
    s = struct.Struct(fmt);
    len = struct.calcsize(fmt) - 8;
    msg = s.pack(5002,401,2006,len,file,table,hdlnum,sql,patton,ctx);

    return msg;

class ReestablishmentCmdMsg(CheckMsg):
    def __init__(self, ueGrpId):
        CheckMsg.__init__(self, MSG_REESTABLISHMENT_REQUEST_CMD, ueGrpId);
        pass;

class ReestablishmentReqMsg(CheckMsg):
    def __init__(self, ueGrpId):
        CheckMsg.__init__(self, MSG_REESTABLISHMENT_REQUEST_CHECK_REQ, ueGrpId);
        pass;

class UserInactiveReqMsg(CheckMsg):
    def __init__(self, ueGrpId):
        CheckMsg.__init__(self, MSG_UE_INACTIVE_CHECK_REQ, ueGrpId);
        pass;