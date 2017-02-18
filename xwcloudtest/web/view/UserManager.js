var moduler = undefined; 
var password;
function updateUserManager(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var userManagerReq = req.body;
    userManagerReq.password = password;
    logger.info(userManagerReq);
    moduler.updateUserManager(userManagerReq, function(err){
            if (err)
            {
                result.result = ERROR;
                result.message = err.message;
            }
            res.json(result);
        });
}

function findUserManager(req,res)
{
    var result = {result : SUCCESS, message : 'success'};

    moduler.findUserManager({}, function(err, user){
        if (err)
        {
            logger.info('find UserManagerConfig fail. ', err);
            result.message = err.message;
        }
        else 
        {
            var usrcfg = user[0];
            password = usrcfg.user_config.password;
            if(usrcfg.Type === 'LDAP')
            {
                usrcfg.user_config.password = '********';
            }
            result.user = usrcfg;
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
             {url : '/front/system/usrcfg/', method : "PUT", process : updateUserManager}
        ,    {url : '/front/system/usrcfg/', method : "GET", process : findUserManager}
    ];
};
