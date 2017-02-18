var moduler = undefined; 

function createComponent(req, res)
{
    var component = req.body;
    var result = {result : SUCCESS, message : 'success'};

    logger.info('user ' + component.user + ' create component ', component.name);

    if (!component.sequenceOfOpera || component.sequenceOfOpera.length == 0)
    {
        result.result = ERROR;
        result.message = 'Does not include atomic operation';
        res.json(result);
    }
    else
    {
        moduler.createComponent(component, function (err, res1){
            if (!err)
            {
                result.compon_id = res1.id; 
                logger.info('create component. id : ', res1.id);
            }
            else
            {
                result.result = ERROR;
                result.message = err.message;
                logger.error("create component error. ", err.message);
            }

            logger.info("create component result : ", result);

            res.json(result);
        });
    }
}

function removeComponent(req, res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.deleteComponent({id : id}, function (err){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
        }
        else
        {
            logger.error("remove component error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function updateComponent(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var component = req.body;

    moduler.updateComponent(component, function (err){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
        }
        else
        {
            logger.error("update component error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function getComponent(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.getComponent({id : id}, function (err, component){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.component = [component];
        }
        else
        {
            logger.error("get component error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function findComponent(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var filter = {};

    var resouceList = undefined;

    if (req.query.all)
    {
        logger.info('req query all : ', req.query.all);
        filter.all = req.query.all;
    }

    if (req.query.user)
    {
        logger.info('req query user : ', req.query.user);
        filter.user = req.query.user;
    }

    moduler.findComponent(filter, function(err,list){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.component = list;
            res.json(result);
        }
        else
        {
            logger.error("find component list error. ", err.message);
            result.message = err.message;
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
         {url : '/front/component', method : 'POST', process : createComponent}
        ,{url : '/front/component', method : 'PUT', process : updateComponent}
        ,{url : '/front/component/:id', method : "DELETE", process : removeComponent}
        ,{url : '/front/component/list', method : "GET", process : findComponent}
        ,{url : '/front/component/:id', method : "GET", process : getComponent}
    ];
};