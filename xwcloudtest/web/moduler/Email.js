var util = require('util');

var database = undefined;

function update(email, callback)
{
    database.EmailSeverConfig.update({$set : email}, function (err){
        if (err)
        {
            logger.info("update EmailSeverConfig error. ", err);
        }
        else
        {
            logger.info("update EmailSeverConfig success. ");
        }

        callback(err);
    });
}

function find(filter, callback)
{
    database.EmailSeverConfig.find().exec(callback);
}

module.exports = function (db) {
    database = db;

    return {
        'updateEmail' : update
      , 'findEmail' : find
    };
}
