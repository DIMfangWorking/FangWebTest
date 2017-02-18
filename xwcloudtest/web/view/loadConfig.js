function loadEiConfig(req,res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.loadEiXML({config:req.body.file}, function(err, obj){
        if (err)
        {
            logger.info('load fail. ', err);
            result.message = err.message;
        }
        else
        {
            result.result = obj;
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/front/ei/load', method : "POST", process : loadEiConfig},
    ];
};