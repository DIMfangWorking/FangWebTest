var util = require('util');

var database = undefined;
global.timer_update = undefined;

function update(user, callback)
{
    database.UserManagerConfig.update({}, {$set : {user_config:user}}, function (err){
        if (err)
        {
            logger.info("update UserManagerConfig error. ", err);
        }
        else
        {
            logger.info("update UserManagerConfig success. ");

            var options = {
                port: config.auth.port,
                hostname: config.auth.ip,
                method: 'POST',
                path: '/user/config',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };
            var postData = undefined;
            sendHttpRequest(options, postData, function (err, res, chunk) {
                if (err) logger.error(err);
                logger.info("/user/config response");
            });
        }
        callback(err);
    });
}

function find(filter, callback)
{
    database.UserManagerConfig.find().exec(callback);
}

module.exports = function (db) {
    database = db;

    return {
        'updateUserManager' : update
      , 'findUserManager' : find
    };
}
