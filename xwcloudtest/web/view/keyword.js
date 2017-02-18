var moduler = undefined; 

function getKeyWord(req,res)
{
    var result = {result : ERROR, message : 'not found key word'};
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

    if (req.query.name)
    {
        logger.info('req query count : ', req.query.count);
        filter.name = req.query.name;
    }

    moduler.findKeyWord(filter, function(err,list){
        if (!err)
        {
            result.result = SUCCESS;
            result.message = 'success';
            result.keyword = list;
            res.json(result);
        }
        else
        {
            logger.error("get key word list error. ", err.message);
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/front/keyword/list', method : "GET", process : getKeyWord}
    ];
};