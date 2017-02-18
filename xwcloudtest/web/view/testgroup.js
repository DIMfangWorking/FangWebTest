var moduler = undefined; 

function createTestGroup(req, res)
{
    var testgroup = req.body;
    var result = {result : SUCCESS, message : 'success'};

    logger.info('user ' + testgroup.user + ' create test case ', testgroup.name);

    if (!testgroup.testcase || testgroup.testcase.length == 0)
    {
        result.result = ERROR;
        result.message = 'Does not include atomic operation';
        res.json(result);
    }
    else
    {
        moduler.createTestGroup(testgroup, function (err, res1){
            if (!err)
            {
                result.testcase_id = res1.id; 
                logger.info('create test group. id : ', res1.id);
            }
            else
            {
                result.result = ERROR;
                result.message = err.message;
                logger.error("create test group error. ", err.message);
            }

            logger.info("create test group result : ", result);

            res.json(result);
        });
    }
}

function removeTestGroup(req, res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.deleteTestGroup({id : id}, function (err){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
        }
        else
        {
            logger.error("remove test group  error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function updateTestGroup(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var testgroup = req.body;

    if (!testgroup.testcase || testgroup.testcase.length == 0)
    {
        result.result = ERROR;
        result.message = 'Does not include test case';
        res.json(result);
    }
    else
    {
        moduler.updateTestGroup(testgroup, function (err){
            if (!err)
            {
                result.result = SUCCESS;
                result.message = 'success';
            }
            else
            {
                logger.error("update test group error. ", err.message);
                result.message = err.message;
            }
            res.json(result);
        });
    }
}

function getTestGroup(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.getTestGroup({id : id}, function (err, testgroup){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.testgroup = [ testgroup ];
        }
        else
        {
            logger.error("get test case ergroupror. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function findTestGroup(req,res)
{
    var result = {result : ERROR, message : 'not found test group'};
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

    if (req.query.count)
    {
        logger.info('req query count : ', req.query.count);
        filter.count = req.query.count;
    }

    if (req.query.type)
    {
        logger.info('req query type : ', req.query.type);
        filter.type = req.query.type;
    }

    moduler.findTestGroup(filter, function(err,list){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.testgroup = list;
            res.json(result);
        }
        else
        {
            logger.error("get test group list error. ", err.message);
            result.message = err.message;
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
         {url : '/front/testgroup', method : 'POST', process : createTestGroup}
        ,{url : '/front/testgroup', method : 'PUT', process : updateTestGroup}
        ,{url : '/front/testgroup/:id', method : "DELETE", process : removeTestGroup}
        ,{url : '/front/testgroup/list', method : "GET", process : findTestGroup}
        ,{url : '/front/testgroup/:id', method : "GET", process : getTestGroup}
    ];
};