//var mongoose = require('mongoose');

var Redis = require('ioredis');

var redis = new Redis({port:config.cache.port, host:config.cache.ip, db : 1});

var database = undefined;

function findResource(filter, callback)
{
    var selector = {};
    if (filter.major_id)
    {
        logger.info('filter major id : ', filter.major_id);
        selector.major_id = parseInt(filter.major_id);
    }

    if (filter.type)
    {
        logger.info('filter type : ', filter.type);
        selector.type = filter.type;

    }

    if(filter.sub_resource && filter.sub_resource.resource_type)
    {
        logger.info('filter Res_type : ', filter.sub_resource.resource_type);
        selector["report_info.resource_type"] = filter.sub_resource.resource_type ;
    }

    database.Resource.find(selector).exec(callback);
}

function findUE(filter, callback)
{
    switch(filter.name)
    {
        case 'enb':
            redis.pipeline().hgetall('enb.' + filter.id).exec(function(err, list){
                if (err || !list)
                {
                    callback(err, list);
                }
                else
                {
                    var obj = list[0][1];
                    var result = [];
                    for(var key in obj)
                    {
                        var tmp = key.split('.');
                        if (tmp.length == 2 && !result[tmp[1]])
                        {
                            result[tmp[1]] = {'cellid' : tmp[1], 'uelist': []};
                        }
                        if (tmp.length == 3)
                        {
                            result[tmp[1]]['uelist'].push({'imsi':tmp[2]/10});
                        }
                    }
                    
                    var result1 = [];
                    for (var i = 0; i < result.length; i++)
                    {
                        if (result[i] && result[i]['uelist'].length > 0)
                        {
                            result1.push(result[i]);
                        }
                    }
                    
                    callback(err, result1);
                }
            });
            break;
        case 'cell':
            callback("not support query cell", null);
            break;
        case 'ue':
            logger.debug("pipeline ", filter);

            redis.pipeline().hgetall(filter.id+'0.info')
              .lrange(filter.id+'0.thr', 0, -1)
              .exec(function(err, list){
                logger.debug("pipeline ", err, list);
                if (err || !list)
                {
                    callback(err, list);
                }
                else
                {
                    var info = list[0][1];
                    var thr = list[1][1];
                    var result = info;

                    result['thr'] = [];
                    thr.forEach(function(item){
                        item = JSON.parse(item);
                        if (result['thr'].length >= filter.duration)
                        {
                            return;
                        }

                        if (item.time>=filter.starttime && item.time <= filter.endtime)
                        {
                           result['thr'].push(item);
                        }
                    });
                    
                    logger.debug('result ', result);
                    
                    callback(err, result);
                }
            });
            break;
        default :
            break;
    }
}

function findRealBBU(filter, callback)
{
    var selector = {};

    selector["report_info.name"] = 'bbu';

    database.Resource.find(selector).select({"report_info":1}).exec(function(err, list){
        if (err || !list)
        {
            callback(err, list);
        }
        else
        {
            var result = [];
            list.forEach(function(slave) {
                slave.report_info.forEach(function(subresource){
                    if ( subresource.name == 'bbu')
                    {
                        result.push({enbid   : subresource.enbID
                                   , enbName : subresource.enbName
                                   , enbIP   : subresource.ip
                                   , status  : subresource.status});
                    }
                });
            });
            callback(null, result);
        }
    });
}

module.exports = function (db) {
    database = db;
    return {
        'findResource' : findResource
       ,'findRealBBU' : findRealBBU
       ,'findUE':findUE
    };
}