var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
var spawnSync = require('child_process').spawnSync;
var ftp = require('ftp');
var Q = require('q');
var xmlbuilder = require('xmlbuilder');
var parseString = require('xml2js').parseString;

var DeviceInfo = { bbu : {status : STATUS_LOST
                        , ip : '0.0.0.0'
                        , eNBId : 0
                        , eNBName : ''
                        , au8DstIP1 : '0.0.0.0'
                        , au8DstIP2 : '0.0.0.0'
                        , au8DstIP3 : '0.0.0.0'
                        , au8DstIP4 : '0.0.0.0'
                        , omc_status : 1}
                 , rru : [ ] };

function hexIPToStrIP(ip)
{
    var ipStr = parseInt(ip[0]+ip[1], 16);
    ipStr += '.' + parseInt(ip[2]+ip[3], 16);
    ipStr += '.' + parseInt(ip[4]+ip[5], 16);
    ipStr += '.' + parseInt(ip[6]+ip[7], 16);
    return ipStr;
}

function jsOjbToMngObj(obj)
{
    var result = {};
    obj = obj.result;
    
    result.result = obj.result[0];
    result.message = obj.message[0];
    if (obj.list && obj.list[0])
    {
        result.list = [];
        for (var key in obj.list[0])
        {
            if (key !== '$')
            {
                var objects = obj.list[0][key];
                objects.forEach(function (object){
                    var tmp = {};
                    object.field.forEach(function(field){
                        tmp[field.$.name] = field.$.value;
                    });
                    result.list.push(tmp);
                });
            }
            else
            {
                result.key = {};
                result.key['name'] = obj.list[0].$.name;
                result.key['count'] = obj.list[0].$.count;
            }
        }
    }
    return result;
}

function getInfoAndParse(data, callback)
{
    logger.debug(data);
    sendHttpRequest(data, null, function (err, res, chunk) {
        if (err || !chunk)
        {
            SlaveManager.changeToLost();
            logger.error('get info fail. ', err);
            if (!err)
                err = 'response is none';
            callback(err, chunk);
        }
        else
        {
            parseString(chunk, function (err, result) {
                try {
                    if (err || result.result.result[0] != 0)
                    {
                        SlaveManager.changeToLost();
                        logger.error('get fail.', err, chunk);
                        if (!err)
                            err ='result is '+ result.result.result[0] + ' message :' +  result.result.message[0];
                        callback(err,result);
                    }
                    else
                    {
                        obj = jsOjbToMngObj(result);
                        if (!obj)
                            err = 'parse obj is none. result = ' + util.inspect(result, {showHidden : true, depth : null});
                        callback(err,obj);
                    }
                }
                catch(e){
                    err = 'result = ' + util.inspect(result, {showHidden : true, depth : null}) + ' error :' + e;
                    if (result.html)
                    {
                        uploadXMLCgi();
                    }
                    callback(err,result);
                }
            });
        }
    });
}

function getBBUIPInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_ipv4',
    logger.debug('get ipv4 info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.bbu.ip = hexIPToStrIP(result.list[0].au8IPAddr);
            logger.debug('bbu ip = ', DeviceInfo.bbu.ip);
            reslove(data);
        }
        else
        {
            data.error = 'get ipv4 count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getEnbParaInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_enb_para';
    logger.debug('get enb para info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.bbu.eNBId = result.list[0].u32eNBId;
            DeviceInfo.bbu.eNBName = result.list[0].au8eNBName;
            reslove(data);
        }
        else
        {
            data.error = 'get enb para count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getSctpInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_sctp';
    logger.debug('get sctp info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.bbu.au8DstIP1 = hexIPToStrIP(result.list[0].au8DstIP1);
            DeviceInfo.bbu.au8DstIP2 = hexIPToStrIP(result.list[0].au8DstIP2);
            DeviceInfo.bbu.au8DstIP3 = hexIPToStrIP(result.list[0].au8DstIP3);
            DeviceInfo.bbu.au8DstIP4 = hexIPToStrIP(result.list[0].au8DstIP4);
            DeviceInfo.bbu.sctp_status = result.list[0].u32Status;
            reslove(data);
        }
        else
        {
            data.error = 'get sctp count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getOmcInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_omc';
    logger.debug('get omc info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.bbu.omc_status = result.list[0].u32Status;
            reslove(data);
        }
        else
        {
            data.error = 'get omc count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getBoradInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_board';
    logger.debug('get borad info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.rru = [];
            result.list.forEach(function(borad){
                if (borad.u8BDType === '2')
                {
                    DeviceInfo.rru.push({u8RackNo : borad.u8RackNO
                                       , u8ShelfNo : borad.u8ShelfNO
                                       , u8SlotNo : borad.u8SlotNO
                                       , u32Status : borad.u32Status})
                }
            });
            reslove(data);
        }
        else
        {
            data.error = 'get borad count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getCellParaInfo(data, reslove, reject)
{
    data.options.path = '/cgi-bin/lteBtsXml?operationType=select&target=query&tableName=t_cel_para';
    logger.debug('get cell para info');
    getInfoAndParse(data.options, function (err, result){
        if (err)
        {
            data.error = err;
            logger.info(err);
            reject(data);
        }
        else if (result.list && result.list.length > 0 && DeviceInfo.bbu)
        {
            SlaveManager.changeToQueryIdle();
            DeviceInfo.bbu.cell=[];
            result.list.forEach(function(cell){
                var tmp = {};
                if (cell.u8CId && cell.u16PhyCellId && cell.u32Status)
                {
                    tmp.u8CId = cell.u8CId;
                    tmp.u16PhyCellId = cell.u16PhyCellId;
                    tmp.u32Status = cell.u32Status;
    
                    DeviceInfo.bbu.cell.push(tmp);
                }
            });
            reslove(data);
        }
        else
        {
            data.error = 'get cell para count is 0.' + util.inspect(result, {showHidden : true, depth : null});
            logger.error(data.error);
            reject(data);
        }
    });
}

function getDeviceInfo()
{
    var options = {
        port: 80,
        hostname: '17.31.16.230',
        method: 'GET',
    };

    function doneGetInfo(data)
    {
        logger.debug('eNB info : ', util.inspect(DeviceInfo, {showHidden : true, depth : null}));
        if (data.error)
            logger.info('error info : ', util.inspect(data.error, {showHidden : true, depth : null}));
    }

    makePromise(getBBUIPInfo, {options : options})
          .then(makePromiseFunction(getEnbParaInfo), makePromiseFunction(getEnbParaInfo))
          .then(makePromiseFunction(getSctpInfo), makePromiseFunction(getSctpInfo))
          .then(makePromiseFunction(getOmcInfo), makePromiseFunction(getOmcInfo))
          .then(makePromiseFunction(getBoradInfo), makePromiseFunction(getBoradInfo))
          .then(makePromiseFunction(getCellParaInfo), makePromiseFunction(getCellParaInfo))
          .done(doneGetInfo, doneGetInfo, undefined);
}


function uploadXMLCgi()
{
    var result = 0;
    result = spawnSync("python", ["-u", "AutoTest","uploadCGI"], {cwd:config.slave.testframwrok_path, encoding:'UTF-8'});
    if (result.status !=0 || result.error)
    {
        logger.error("upload CGI fail. ");
        if (result.error)
            logger.error(result.error);
        if (result.stdout)
            logger.error(result.stdout);
        if (result.stderr)
            logger.error(result.stderr);
        return ERROR;
    }
    return SUCCESS;
}

function StartingSlave()
{
    logger.info("Starting Slave");

    result = uploadXMLCgi();
    if (SUCCESS != result)
    {
        process.exit(1);
    }

    getDeviceInfo();

    setInterval(getDeviceInfo, 1 * 1000 * 60);
}

function SlaveManagerClass()
{
  var status = STATUS_LOST;

  setTimeout(StartingSlave, 100);

  this.changeToQueryIdle = function ()
  {
    if (status == RESOURCE_STATUS_BUSY)
    {
        return ;
    }

    status = RESOURCE_STATUS_IDLE;
    DeviceInfo.bbu.status = status;
  };

  this.changeToIdle = function ()
  {
    status = RESOURCE_STATUS_IDLE;
    DeviceInfo.bbu.status = status;
  };

  this.changeToLost = function ()
  {
    if (status == RESOURCE_STATUS_BUSY)
    {
        return ;
    }

    status = STATUS_LOST;
    DeviceInfo.bbu.status = status;
  };

  this.changeToBusy = function ()
  {
    status = RESOURCE_STATUS_BUSY;
    DeviceInfo.bbu.status = status;
  };

  function setStatus(status)
  {
    var u32Status = '0';

    DeviceInfo.bbu.status = status;

    switch(status)
    {
      case STATUS_LOST:
        u32Status = '1';
        break;
      case RESOURCE_STATUS_BUSY:
        u32Status = '2';
        break;
      default:
        return;
        break;
    }

    DeviceInfo.rru.forEach(function(item){
        item.u32Status = u32Status;
    });
  }

  this.getInformation = function ()
  {
    if (status == STATUS_LOST)
    {
        setStatus(STATUS_LOST);
    }
    else if (status == RESOURCE_STATUS_BUSY)
    {
        setStatus(RESOURCE_STATUS_BUSY);
    }

    return DeviceInfo;
  };
}

global.SlaveManager = new SlaveManagerClass();

module.exports = {
    SlaveManager : SlaveManager
}