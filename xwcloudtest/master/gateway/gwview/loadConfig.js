function loadEiConfig(req, res)
{
    var result = {result : SUCCESS, message : 'success'};

    moduler.loadEIDetailed({}, function(err, obj){
        if (err)
        {
            logger.info('load fail. ', err);
            result.message = err.message;
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/master/ei/reload', method : "POST", process : loadEiConfig},
    ];
};