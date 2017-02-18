var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString;

function jsToObj(data, reslove, reject)
{
    var message = data.message;
    var obj = { };

    for (var key in message)
    {
        msgId = message[key].$.MsgId;

        obj[msgId] = { 'MsgId' : parseInt(msgId)
                     , 'DspId' : parseInt(message[key].$.DspId)
                     , 'CoreId' : parseInt(message[key].$.CoreId)
                     , 'name' :  message[key].$.msgname.trim() };

        obj[msgId].Tlv = { };
        tlv = message[key].TLV;

        for (var t in tlv)
        {
            tlvId = parseInt(tlv[t].$.id);
            delete tlv[t].$.id;
            obj[msgId].Tlv[tlvId] = { name : tlv[t].$.name.trim(), struct : tlv[t].$.struct.trim() };
        }

        obj[msgId].Struct = { };
        struct = message[key].Struct;

        for (var s in struct)
        {
            logger.debug('\'', struct[s].$.name.trim(), '\'')
            obj[msgId].Struct[struct[s].$.name.trim()] = [ ];

            variable = struct[s].Variable;

            for (var v in variable)
            {
                tmp = {};
                tmp['name'] = variable[v].$.name.trim();
                tmp['type'] = variable[v].$.type.trim();
                obj[msgId].Struct[struct[s].$.name.trim()].push(tmp);
            }
        }
    }

    // console.log(util.inspect(obj, {showHidden:true, depth:null}));

    data.obj = obj;

    reslove(data);
}

function parseXml(data, reslove, reject)
{
    parseString(data.xml, function(err, result){
        if (err || !result)
        {
            data.error = err;
            reject(data)
        }
        else
        {
            data.message = result['EI_PCAP']['message'];
            reslove(data);
        }
    });
}

function readFile(data, reslove, reject)
{
    fs.readFile(data.file, 'utf8', function(err, result){
        if (err || !result)
        {
            data.error = err;
            reject(data)
        }
        else
        {
            data.xml = result;
            reslove(data);
        }
    });
}

function loadEiConfig(file, callback)
{
    makePromise(readFile, { 'file' : file })
          .then(makePromiseFunction(parseXml), defaultErrorProcess)
          .then(makePromiseFunction(jsToObj), defaultErrorProcess)
          .done(function (data) {
                logger.info('ei basic load complete.');
                callback(null, data.obj);
             }, function (data) {
                logger.info("ei basic load fail. data : ", data.error ? data.error : data);
                callback(data.error, null);
             }, undefined);
}

module.exports = loadEiConfig;