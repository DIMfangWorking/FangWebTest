var util = require('util');

var database = undefined;

function updateManual(filter, callback)
{
    database.UserManagerConfig.findOne({"Type" : "LDAP"}, function(err, data) {
        if(err)
        {
            logger.info("find LDAP fail. ", err);
        }
        else
        {
            logger.info("find LDAP success. ");
            config.ldap = data.user_config;
            config.ldap.last_updatetime = new Date();
            ldapconfig.UpdateLDAP(config);

            var options = {
                port: MasterStore.port,
                hostname: MasterStore.ip,
                method: 'POST',
                path: '/master/LDAP',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };
            var postData = undefined;
            sendHttpRequest(options, postData, function () {});
        }
        callback(err);
    });
}

module.exports = function (db) {
    database = db;
    return {
        'updateManual' : updateManual
    };
}
