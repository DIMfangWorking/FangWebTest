var fs = require('fs');
var util = require('util');

function EIConfigSerialize(data, callback)
{
    callback(null, null);

    logger.info('data', data);

    var fd = fs.openSync(config.slave.testframwrok_path + '/ei.json', 'w');
    fs.write(fd, JSON.stringify(data), function (err){
        if (err) logger.info(err);
    });
}

module.exports = function (db) {
    return {
        'EIConfigSerialize' : EIConfigSerialize,
    };
};