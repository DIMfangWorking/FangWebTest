var parm = undefined;
function filter(req, res, next) {
    //ogger.info('request Route: ', req.route);
    next();
}

module.exports = function(par){
    parm = par;
    return filter;
}