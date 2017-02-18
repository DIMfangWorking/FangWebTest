var moduler = undefined; 

function createCI(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var CiReq = req.body;

    moduler.createCI(CiReq, function(err, ci){
        if (err)
        {
            result.result = ERROR;
            result.message = err.message;
        }
        else
        {
            result.id = ci.Id;
        }
        res.json(result);
    });
}

function updateCI(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var CiReq = req.body;

    if (!CiReq.id)
    {
        result.result = ERROR;
        result.message = 'not found ci';
        res.json(result);
    }
    else
    {
        moduler.updateCI(CiReq, function(err){
            if (err)
            {
                result.result = ERROR;
                result.message = err.message;
            }
            res.json(result);
        });
    }
}

function deleteCI(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.deleteCI({ id : id }, function(err){
        if (err)
        {
            result.result = ERROR;
            result.message = err.message;
        }
        res.json(result);
    });
}

function getCI(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.getCIById(id, function(err, system_CI){
        if (err)
        {
            result.message = err.message;
            logger.info('get ci fail. ', err);
        }
        else 
        {
            result.system_CI = [system_CI];
        }

        res.json(result);
    }); 
}

function findCI(req,res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.findCI({}, function(err, system_CI){
        if (err)
        {
            logger.info('find ci fail. ', err);
            result.message = err.message;
        }
        else 
        {
            result.system_CI = system_CI;
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
             {url : '/front/system/CI/', method : "POST", process : createCI},
             {url : '/front/system/CI/', method : "PUT", process : updateCI},
             {url : '/front/system/CI/:id', method : "DELETE", process : deleteCI},
             {url : '/front/system/CI/list', method : "GET", process : findCI},
             {url : '/front/system/CI/:id', method : "GET", process : getCI},
    ];
};
