var statusMachine = require('../common/app.js');

function filter(req, res, next)
{
    var matchResult = (req.originalUrl.match(/^\/master\/\w*$/g) == null);
    if (statusMachine.getStatus() != 'normal' && matchResult)
    {
        res.json({result:ERROR, message:"master is lost"});
        res.end();
    }
    else
    {
        next();
    }
}

module.exports = function (par){
    return filter;
}