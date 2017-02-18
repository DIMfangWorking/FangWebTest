var moduler = undefined;

function task(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.debug("user start task ", req.body);

    moduler.createTask(req.body, function (err, data){
        logger.info("err : " + err + " data : " + data);
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

function autoTask(req, res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.debug("user start task ", req.body);

    moduler.createAutoTask(req.body, function (err, data){
        logger.info("err : " + err + " data : " + data);
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

function rerunAutoTask(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    var task_id = parseInt(req.param('task_id'));
    var task = req.body;

    task.original_id = task_id;

    moduler.rerunAutoTask(task, function (err, data){
        logger.info("err : " + err + " data : " + data);
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

function taskReport(req, res)
{
    var result = {result : SUCCESS, message : 'success' };

    var task = req.body;

    logger.info("status : ", req.body);

    task.id = task.task_id;
    delete task.task_id;

    moduler.taskReport(task, function(err){
        if (err)
        {
            result.result = ERROR;
            result.message = err;
        }
        res.json(result);
    });
}

function taskResult(req, res)
{
    var result = {result : SUCCESS, message : 'success' };

    var task = req.body;

    logger.info("result : ", req.body);

    task.id = task.task_id;
    delete task.task_id;

    moduler.taskResult(task, function (err){
        if (err)
        {
            result.result = ERROR;
            result.message = err;
        }
        res.json(result);
    })
}

module.exports = function (mod) {
    moduler = mod;

    return [ 
        {url : '/master/task', method : 'POST', process : task},
        {url : '/master/CI/task', method : 'POST', process : autoTask},
        {url : '/master/CI/rerun/:task_id', method : 'POST', process : rerunAutoTask},
        {url : '/slave/task/report', method : 'POST', process : taskReport},
        {url : '/slave/task/result', method : 'POST', process : taskResult},
    ];
};
