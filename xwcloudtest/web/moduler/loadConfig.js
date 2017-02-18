var database = undefined;

function loadEiXML(file, callback)
{
    loadEiConfig(file.config, function (err, obj){
        callback(err, obj);

        if (!err)
        {
            if (MasterStore.status == STATUS_LOST)
            {
                callback("master is lost", null);
                return;
            }

            var options = {
                port: MasterStore.port,
                hostname: MasterStore.ip,
                method: 'POST',
                path: '/master/ei/reload',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };

            sendHttpRequest(options, null, function (err, res, chunk) {
                if (err) logger.error(err);
            });
        }
    });
}

module.exports = function(db){
    database = db;

    loadEiConfig('./pcapconfig.xml', function (err, message){
        if (err || !message)
        {
            throw Exception('load xml error');
        }

        for (var index in message)
        {
            new db.EIDetailed(message[index])
                .save(function(err){
                    // if (err) logger.error("save ei basic error.", err);
                });
        }
    });

    return {
        'loadEiXML' : loadEiXML
    };
};