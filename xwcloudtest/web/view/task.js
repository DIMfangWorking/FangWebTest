var util = require('util');
var moduler = undefined;

function task(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.debug("user start task ", req.body);

    moduler.createTask(req.body, function (err, res1){
        if (res1 && res1.result == SUCCESS)
        {
            result.task_id = res1.task_id; 
            logger.info('create task. id : ', res1.task_id);
        }
        else
        {
            result.result = ERROR;
            if (res1 && res1.message)
            {
                result.message = res1.message;
            }
            else
            {
                result.message = 'crate task fail!';
            }
            logger.error("create task error. ", err);
        }
        res.json(result);
    });
}

function autoTask(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.debug("user start task ", req.body);

    if (util.isNullOrUndefined(req.body['type']))
    {
        result.message = 'get type file!';
        res.json(result);
    }

    if (util.isNullOrUndefined(req.body['env_type']))
    {
        result.message = 'get env_type file!';
        res.json(result);
    }    

    moduler.createAutoTask(req.body, function (err, res1){
        if (res1 && res1.result == SUCCESS)
        {
            result.task_id = res1.task_id; 
            logger.info('create task. id : ', res1.task_id);
        }
        else
        {
            result.result = ERROR;
            if (res1 && res1.message)
            {
                result.message = res1.message;
            }
            else
            {
                result.message = 'crate task fail!';
            }
            logger.error("create task error. ", err);
        }
        res.json(result);
    });
}

function rerunAutoTask(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    var task_id = req.param('task_id');

    moduler.rerunAutoTask(task_id, function (err, res1){
        if (res1 && res1.result == SUCCESS)
        {
            result.task_id = res1.task_id; 
            logger.info('create task. id : ', res1.task_id);
        }
        else
        {
            result.result = ERROR;
            if (res1 && res1.message)
            {
                result.message = res1.message;
            }
            else
            {
                result.message = 'crate task fail!';
            }
            logger.error("create task error. ", err);
        }
        res.json(result);
    });
}

function taskInfo(req,res)
{
    var task_id = req.param('task_id');
    var result = {result : SUCCESS, message : 'success' };

    logger.debug("user get task info. task id : " + task_id);
    moduler.getTask({id : task_id}, function (err, data) {
        if (err)
        {
            logger.info('not found task. id : ' + task_id + ' err : ' + err);
            result.result = ERROR;
            result.message = 'not found task. id : ' + task_id;
        }
        else
        {
            result.task = data;
        }

        res.json(result);
    });
}

function taskLogInfo(req,res)
{
    var result = {result : SUCCESS, message : 'success' };

    var task_id = req.param('task_id');
    var log_id = req.param('log_id');

    logger.debug("user get task log info. task id : " + task_id + " log id : " + log_id);
    
    moduler.getTask({id : task_id, log_id : log_id}, function (err, data) {
        if (err)
        {
            logger.info('not found task. id : ' + task_id + ' err : ' + err);
            result.result = ERROR;
            result.message = 'not found task. id : ' + task_id;
        }
        else
        {
            var task = data;
            var index = task.current_log_id - task.logs.length;
            result.task_id = task.id;
            result.status = task.status;
            result.step = task.step;
            result.current_log_id = task.current_log_id;
            result.log = [];

            logger.debug("task log info : ", task.logs);

            if (task.logs.length > 0)
            {
                for (var value in task.logs)
                {
                    logger.debug("logs "+value+" ", task.logs[value]);
                    result.log.push({id: index, content: task.logs[value]});
                    index ++;
                    //if (index >= 10)
                       //break;
                }
            }

            logger.debug("result log info : ", result.log);
        }

        res.json(result);
    });
}

function taskListInfo(req, res)
{
    var result = {result : ERROR, message : 'not found task' };
    var filter = {};
    var query = req.query;

    if (query.all)
    {
        filter.all = query.all;
    }

    if (query.count)
    {
        filter.count = query.count;
    }
    else
    {
        filter.count = 50;
    }

    if (query.task_id)
    {
        filter.task_id = query.task_id;
    }

    if (query.major_id)
    {
        filter.major_id = query.major_id;
    }

    if (query.minor_id)
    {
        filter.minor_id = query.minor_id;
    }
    
    moduler.findTaskInfo(filter, function (err, list) {
        if (err)
        {
            logger.info("find task info error. ", err);
        }
        else
        {
            result.result = SUCCESS;
            result.message = "success";
            result.task = list;
        }

        res.json(result); 
    });
}

function EIBasicInfo(req, res)
{
    var result = {result : SUCCESS, message : 'success' };

    var task_id = req.param('task_id');
    moduler.getLastEIBasicInfo({id : task_id}, function (err, obj){
        if (err)
        {
            result.message = err;
        }
        else
        {
            result.ei_basic = obj;
        }
        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;

    return [ 
        {url : '/front/task', method : 'POST', process : task},
        {url : '/front/CI/task', method : 'POST', process : autoTask, auth : true},
        {url : '/front/CI/rerun/:task_id', method : 'POST', process : rerunAutoTask, auth : true},
        {url : '/front/task/info/:task_id', method : 'GET', process : taskInfo},
        {url : '/front/task/list', method : 'GET', process : taskListInfo},
        {url : '/front/task/log/:task_id/:log_id', method : 'GET', process : taskLogInfo},
        {url : '/front/task/eibasic/:task_id/', method : 'GET', process : EIBasicInfo},
    ];
};
