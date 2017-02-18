var moduler = undefined; 

function updateEmail(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var EmailReq = req.body;
    moduler.updateEmail(EmailReq, function(err){
            if (err)
            {
                result.result = ERROR;
                result.message = err.message;
            }
            res.json(result);
        });
}

function findEmail(req,res)
{
    var result = {result : SUCCESS, message : 'success'};

    moduler.findEmail({}, function(err, email){
        if (err)
        {
            logger.info('find email fail. ', err);
            result.message = err.message;
        }
        else 
        {
            result.email = email[0];
            result.email.Security = email[0].Security.toString();
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
             {url : '/front/system/email/', method : "PUT", process : updateEmail}
        ,    {url : '/front/system/email/list', method : "GET", process : findEmail}
    ];
};
