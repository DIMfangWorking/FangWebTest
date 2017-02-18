var moduler = undefined;

function master(req, res)
{
    logger.trace("master register to web server");

    moduler.saveMaster(req.body);

    res.json({"result" : SUCCESS, message : "Success", master_id : moduler.getMaster().id});

    //logger.info(util.inspect(req,{showHidden : true , depth :1}));
}

function masterInfoUpdate(req, res)
{
    logger.trace("master update to web server");

    moduler.updateMaster(req.body);

    res.json({"result" : SUCCESS, message : "Success"});

    //logger.info(util.inspect(req,{showHidden : true , depth :1}));
}

module.exports = function (mod) {
    moduler = mod;
    return [ 
        {url : '/master/register', method : 'POST', process : master},
        {url : '/master/update', method : 'POST', process : masterInfoUpdate}
    ];
};
