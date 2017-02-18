var util = require('util');

var database = undefined;
var CICurrentIndex = undefined;

function create(ci, callback)
{
    ci.Id = CICurrentIndex ++;

    var model = new database.CIConfig(ci)
    model.save(function(err){
        if (err)
        {
            logger.info("save CIConfig error. ", err);
        }
        else
        {
            logger.info("save CIConfig success. ");
        }
        callback(err, model);
    });
}

function remove(ci, callback)
{
    database.CIConfig.remove({Id : ci.id}).exec(function(err){
        if (err)
        {
            logger.info("remove CIConfig error. ", err);
        }
        else
        {
            logger.info("remove CIConfig success. ");
        }
        callback(err);
    });
}

function update(ci, callback)
{
    //ci.update = new Date();
    database.CIConfig.findOneAndUpdate({Id : ci.id},{$set : ci}, function (err){
        if (err)
        {
            logger.info("update CIConfig error. ", err);
        }
        else
        {
            logger.info("update CIConfig success. ");
        }

        callback(err);
    });
}

function getById(id, callback)
{
    database.CIConfig.findOne({Id : id}).exec(callback);
}

function find(filter, callback)
{
    database.CIConfig.find().sort({Id:1}).exec(callback);
}

module.exports = function (db) {
    database = db;

    database.CIConfig.find({}).select({Id:1}).sort({Id:-1}).limit(1)
        .exec(function(err, list) {
            if (list.length == 0 || (list[0].Id == undefined))
            {
                CICurrentIndex = 1;
            }
            else
            {
                CICurrentIndex = list[0].Id + 1;
            }
            logger.info('CIConfig index = ', CICurrentIndex);
        });

    return {
        'createCI' : create
      , 'deleteCI' : remove
      , 'updateCI' : update
      , 'findCI' : find
      , 'getCIById' : getById
    };
}
