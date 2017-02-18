var moduler = undefined;

function getSessionByIDCallback(sessionid, obj)
{
    return sessionid == obj.id;
}

function task(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.info("user start task ", req.body);

    moduler.createTask(req.body, function (err, data){
        if (!err)
        {
            result.task_id = data.id; 
            result.key = data.redis_key;
            logger.info('create task. id : ', data.id);
        }
        else
        {
            result.result = ERROR;
            result.message = err;//'crate task fail!';
            logger.error("create task error. ", err);
        }

        logger.info("create task result : ", result);

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;

    return [ 
        {url : '/slave/task', method : 'POST', process : task},
    ];
};
