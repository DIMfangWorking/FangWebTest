var moduler = undefined;

function updateManual(req,res)
{
    var result = {result : SUCCESS, message : 'success'};
    moduler.updateManual({}, function(err){
        if (err)
        {
            logger.info('Manual update fail. ', err);
            result.result = ERROR;
            result.message = err.message;
        }
        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/front/system/usrcfg/ldap/manual', method : "POST", process : updateManual}
    ];
};
