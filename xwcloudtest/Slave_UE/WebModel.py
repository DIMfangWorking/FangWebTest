__version__ = "0.1"
__all__ = ["OnlineOption", "OfflineOption", "AtomOption", "AtomOptionResult"]
__author__ = "guowei"

import json;

from UE import *;
from XWCloudServer import Resource;

class OnlineOption(Resource):
  def post(self):
    print 'atom ue online';
    data = self.request.json();
    print data;
    keys = data.keys();
    if 'eNBId' in keys and 'cellId' in keys and 'number' in keys:
      pass;
    else:
      return json.dumps({"result":-1, "message":"missing paramenters"});

    eNBId = int(data['eNBId']);
    cellId = int(data['cellId']);
    num = int(data['number']);

    if eNBId < 0 or eNBId > 0x000FFFFF:
      return json.dumps({"result":-1, "message" : "enbid error"});
    if cellId < 0 or cellId > 255:
      return json.dumps({"result":-1, "message" : "cellid error"});
    if num < 0 or num > 3000:
      return json.dumps({"result":-1, "message" : "ue number error"});

    if eNBId in eNB.eNBDict.keys():
      enb = eNB.eNBDict[data['eNBId']];
    else :
      return json.dumps({"result":-1, "message":"not found enb"});

    if cellId == 255:
      result = [];
      cells = enb.getCell();
      cellCount = enb.getCellCount();

      if cellCount == 0:
        return json.dumps({"result":-1, "message":"not found cell"});

      cellIndex = 0;
      while num :
        result.append(cells[cellIndex].getUE(1));
        num -= 1;
        cellIndex += 1;
        cellIndex %= cellCount;
    else:
      cell = enb.getCell(cellId);
      result = cell.getUE(num);
      
    resultStr = [];
    for ue in result:
      resultStr.append({"imsi":ue.IMSI,"enbid": ue.enb.id, "cellid":ue.cell.id, "ip": ue.ip});

    return json.dumps({"result":0, "message": "success", "UE" : resultStr});

class OfflineOption(Resource):
  def post(self):
    print 'atom ue online';
    return json.dumps({"result":-1, "message":"not support ue offline"});

class AtomOption(Resource):
  def post(self):
    # curl http://172.31.4.39:3000/UE/Option -d '{"IMSI":3535946203434499309, "duration":200, "opetionType" : "ping", "PDNIP":"1.2.3.4"}'
    data = self.request.json();
    keys = data.keys();
    if 'IMSI' in keys and 'opetionType' in keys and 'duration' in keys:
      pass
    else :
      return json.dumps({"result":-1, "message":"missing paramenters"});

    ue = UE.UEDict[int(data['IMSI'])];
    duration = int(data['duration']);
    opt = data['opetionType'];
    if opt == 'ping' :
      pdnip = data['PDNIP'];
      id = ue.ping(pdnip, duration);
    elif opt == 'DLTCP':
      port = data['DLPort'];
      id = ue.downTcp(port, duration);
    elif opt == 'ULTCP':
      pdnip = data['PDNIP'];
      port = data['ULPort'];
      id = ue.upTcp(pdnip, port, duration);
    elif opt == 'DULTCP':
      pdnip = data['PDNIP'];
      uport = data['ULPort'];
      dport = data['DLPort'];
      id = ue.twoWayTcp(pdnip, uport, dport, duration);
    elif opt == 'DLUDP':
      port = data['DLPort'];
      bandwitdth = data['DLBandWitdth']  * 1024;
      id = ue.downUdp(port, bandwitdth, duration);
    elif opt == 'ULUDP':
      pdnip = data['PDNIP'];
      port = data['ULPort'];
      # unit kb
      bandwitdth = data['ULBandWitdth'] * 1024;
      id = ue.upUdp(pdnip, port, bandwitdth, duration);
    elif opt == 'DULUDP':
      pdnip = data['PDNIP'];
      dport = data['DLPort'];
      dbandwitdth = data['DLBandWitdth'] * 1024;
      uport = data['ULPort'];
      ubandwitdth = data['ULBandWitdth'] * 1024;
      id = ue.twoWayUdp(pdnip, uport, dport, ubandwitdth, dbandwitdth, duration);
    elif opt == 'reboot':
      ue.reboot();
      id = 0;
    else:
      return json.dumps({"result" : -2, "message" : "not support opt " + opt});
    return json.dumps({"result" : 0, "message" : "success", "optionID" : id});

class AtomOptionResult(Resource):
  # curl http://172.31.4.39:3000/UE/OptionResult -d '{"optionID":1}'
  def post(self):
    data = self.request.json();
    if 'optionID' in data.keys():
      pass
    else :
      return json.dumps({"result":-1, "message":"missing paramenters"});

    optid = int(data['optionID']);   
    ue = UE.UEDict[UE.taskDict[optid]];

    result = ue.getTaskResult(optid);
    return json.dumps({"result" : 0, "message" : "success", "atom_result" : result });
