var moduler = undefined; 

function getResource(req, res)
{
    var result = {result : ERROR, message : 'not found resouce'};
    var filter = {};

    var resouceList = undefined;

    if (req.query.all)
    {
        logger.info('req query all : ', req.query.all);
        filter.all = req.query.all;
    }

    if (req.query.major_id)
    {
        logger.info('req query major id : ', req.query.major_id);
        filter.major_id = req.query.major_id;
    }

    if (req.query.type)
    {
        logger.info('req query type : ', req.query.type);
        filter.type = req.query.type;
    }

    if(req.query.resource_type)
    {

        logger.info('req query resource_type :', req.query.resource_type);
        filter.sub_resource ={resource_type : req.query.resource_type};
    }

    moduler.findResource(filter, function(err,list){
        if (!err)
        {
            var resourceList = [];
            list.forEach(function(resource){
                resource = resource.toObject();
                if (resource.status === 'normal' && resource.type === 'real')
                {
                    resource.status = RESOURCE_STATUS_IDLE;
                    resource.report_info.forEach(function(sub){
                        if (sub.status !== 'idle' && sub.name == 'bbu')
                        {
                            resource.status = sub.status;
                            return;
                        }
                    });

                    delete resource.sub_resource;
                    resource.sub_resource = resource.report_info;
                    delete resource.report_info;
                }

                else if(resource.status === 'lost' && resource.type === 'real'){
                    resource.sub_resource = null;
                }

                else if(resource.type === 'simulation')
                {
                    delete resource.sub_resource;
                    resource.sub_resource = [];
                    if(filter.sub_resource)
                    {
                        resource.report_info.forEach(function (sub) {
                            if (filter.sub_resource && filter.sub_resource.resource_type && sub.resource_type == filter.sub_resource.resource_type) {

                                resource.sub_resource.push(sub);
                                return;
                            }

                        });
                    }
                    else
                    {
                        resource.subresource = resource.report_info;
                    }
                    delete resource.report_info;
                }
                resourceList.push(resource);
            });
            res.json(resourceList);
        }
        else
        {
            logger.error("get resource list error. ", err.message);
            res.json(result);
        }
    });
}

function getSubResource(req, res)
{
    var result = {result : ERROR, message : 'not found sub resouce'};
    var filter = { };

    logger.info('req.query ', req.query);
    if (req.query.all)
    {
        logger.info('req query all : ', req.query.all);
        filter.all = req.query.all;
        
        switch (req.query.type)
        {
            case 'bbu':
                moduler.findRealBBU({}, function(err, enbs){
                    result.result = SUCCESS;
                    result.message = 'success';
                    result.enblist = enbs;
                    res.json(result);
                });
                break;
            case 'rru':
            case 'ue':
            default:
                res.json(result);
                break;
        }
    }
    else
    {
        var id = 0;
        var key = '';
        if (req.query.id)
        {
            id = req.query.id;
        }
        else
        {
            res.json(result);
            return;
        }

        filter.subresource = { };

        switch(req.query.type)
        {
            case 'bbu':
                filter.id = id;
                filter.name = 'enb';
                key = 'cellinfolist';
                break;
            case 'rru':
                filter.id = id;
                filter.name = 'cell';
                break;
            case 'ue':
                filter.id = id;
                filter.name = 'ue';
                key = 'ueinfo';

                filter.duration = req.query.duration || 1;
                filter.starttime = req.query.starttime || 0;
                filter.endtime = req.query.endtime || Number.MAX_VALUE;

                break;
            default:
                res.json(result);
                break;
        }

        moduler.findUE(filter, function(err, obj){
            if (err)
            {
                result.message = err;
            }
            else
            {
                result.result = SUCCESS;
                result.message = 'success';
                if (req.query.type == 'ue')
                {
                    result['staticinfo'] = {};
                    result['staticinfo']['enbid'] = obj.enb;
                    result['staticinfo']['cellid'] = obj.cell;
                    result['staticinfo']['ip'] = obj.ip;
                    result['staticinfo']['pci'] = obj.pci;
                    result['dynamicinfo'] = obj['thr'];
                }
                else
                {
                    result[key] = obj;
                }
            }

            res.json(result);
        });
    }
}

module.exports = function (mod) {
    moduler = mod;
    logger.debug("module :", mod);
    return [
        {url : '/front/resource', method : "GET", process : getResource},
        {url : '/front/subresource', method : "GET", process : getSubResource},
    ];
};
