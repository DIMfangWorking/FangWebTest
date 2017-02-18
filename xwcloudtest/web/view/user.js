var moduler = undefined; 

function login(req, res)
{
    var result = {result : AUTH_FAIL, message : 'auth fail'};
    var userReq = req.body;

    logger.info("login : ", req.body);

    moduler.authentication(userReq.name, userReq.password, function(err, user){
        if (err)
        {
            // result.message = 'not found user ' + userReq.name;
            result.message = err.toString();
            logger.info('get user fail. ', err);
        }
        else
        {
            var username = req.session.username;
            logger.debug('authentication', user);
            if (username == undefined)
            {
                result.result = SUCCESS;
                result.message = 'success';
                if(global.originalreq == undefined)
                {
                    result.url = config.web.home_page;
                }
                else
                {
                    result.url = originalreq;
                }

                req.session.ip = req.ip;
                req.session.username = userReq.name;

            }
            else if (req.session.ip == req.ip)
            {
                result.result = SUCCESS;
                result.message = 'success';
                if(global.originalreq == undefined)
                {
                    result.url = config.web.home_page;
                }
                else
                {
                    result.url = originalreq;
                }
            }
            else 
            {
                var message = "The user(" + userReq.name +") has logged in. ip is : " + req.session.ip;
                logger.info(message);
                result.message = message;
                result.user = {name : user.name, username : user.username, group : user.group};
            }
        }

        res.json(result);
    });
}

function logout(req,res)
{
    var result = {result : SUCCESS, message : 'success'};
    originalreq= config.web.home_page;

    var session = req.session;
    if (!session || !session.username)
    {
        result.result = ERROR;
        result.message = 'you not login';
    }
    else
    {
        if (req.ip == session.ip) 
        {
            // delete session
            req.session.destroy(function(err) {
                // cannot access session here
                if (err)
                    logger.info('destory session error. ', err);
            });
        }
        else
        {
            result.result = ERROR;
            result.message = 'session ip not you. ip : ' + session.ip;
        }
    }

    res.json(result);
}

function createUser(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var userReq = req.body;

    moduler.createUser(userReq, function(err, user){
        if (err)
        {
            result.result = ERROR;
            result.message = err.message;
        }
        else
        {
            result.user_id = user.id;
        }
        res.json(result);
    });
}

function updateUser(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var userReq = req.body;

    if (!userReq.id)
    {
        result.result = ERROR;
        result.message = 'not found user';
        res.json(result);
    }
    else
    {
        moduler.updateUser(userReq, function(err){
            if (err)
            {
                result.result = ERROR;
                result.message = err.message;
            }
            res.json(result);
        });
    }
}

function deleteUser(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.deleteUser({ id : id }, function(err){
        if (err)
        {
            result.result = ERROR;
            result.message = err.message;
        }
        res.json(result);
    });
}

function getUser(req, res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.getUserById(id, function(err, user){
        if (err)
        {
            result.message = err.message;
            logger.info('get user fail. ', err);
        }
        else 
        {
            result.user = [user];
        }

        res.json(result);
    }); 
}

function findUser(req,res)
{
    var result = {result : SUCCESS, message : 'success'};
    var id = req.param('id');

    moduler.findUser({}, function(err, user){
        if (err)
        {
            logger.info('find user fail. ', err);
            result.message = err.message;
        }
        else 
        {
            result.user = user;
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/front/user/login', method : "POST", process : login, auth : true},
        {url : '/front/user/logout', method : "POST", process : logout},
        // {url : '/front/user/', method : "POST", process : createUser},
        // {url : '/front/user/', method : "PUT", process : updateUser},
        // {url : '/front/user/\:id', method : "DELETE", process : deleteUser},
        // {url : '/front/user/list', method : "GET", process : findUser},
        // {url : '/front/user/\:id', method : "GET", process : getUser},
    ];
};
