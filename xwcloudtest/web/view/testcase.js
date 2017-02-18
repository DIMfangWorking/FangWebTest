var moduler = undefined; 

function createTestCase(req, res)
{
    var testcase = req.body;
    var result = {result : SUCCESS, message : 'success'};

    logger.info('user ' + testcase.user + ' create test case ', testcase.name);

    if (!testcase.sequenceOfOpera || testcase.sequenceOfOpera.length == 0)
    {
        result.result = ERROR;
        result.message = 'Does not include atomic operation';
        res.json(result);
    }
    else
    {
        moduler.createTestCase(testcase, function (err, res1){
            if (!err)
            {
                result.testcase_id = res1.id; 
                logger.info('create test case. id : ', res1.id);
            }
            else
            {
                result.result = ERROR;
                result.message = err.message;
                logger.error("create test case error. ", err.message);
            }

            logger.info("create test case result : ", result);

            res.json(result);
        });
    }
}

function removeTestCase(req, res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.deleteTestCase({id : id}, function (err){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
        }
        else
        {
            logger.error("remove test case  error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function updateTestCase(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var testcase = req.body;

    if (!testcase.sequenceOfOpera || testcase.sequenceOfOpera.length == 0)
    {
        result.result = ERROR;
        result.message = 'Does not include atomic operation';
        res.json(result);
    }
    else
    {
        moduler.updateTestCase(testcase, function (err){
            if (!err)
            {
                result.result = SUCCESS;
                result.message = 'success';
            }
            else
            {
                logger.error("update test case error. ", err.message);
                result.message = err.message;
            }
            res.json(result);
        });
    }
}

function getTestCase(req,res)
{
    var result = {result : ERROR, message : 'error'};
    var id = req.param('id');

    moduler.getTestCase({id : id}, function (err, testcase){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.testcase = [testcase];
        }
        else
        {
            logger.error("get test case error. ", err.message);
            result.message = err.message;
        }
        res.json(result);
    });
}

function findTestCase(req,res)
{
    var result = {result : ERROR, message : 'not found test case'};
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

    moduler.findTestCase(filter, function(err,list){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.testcase = list;
            res.json(result);
        }
        else
        {
            logger.error("get test case list error. ", err.message);
            result.message = err.message;
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
         {url : '/front/testcase', method : 'POST', process : createTestCase}
        ,{url : '/front/testcase', method : 'PUT', process : updateTestCase}
        ,{url : '/front/testcase/:id', method : "DELETE", process : removeTestCase}
        ,{url : '/front/testcase/list', method : "GET", process : findTestCase}
        ,{url : '/front/testcase/:id', method : "GET", process : getTestCase}
    ];
};