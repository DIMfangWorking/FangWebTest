var moduler = undefined;

function authenticate(req, res) {
    var result = {result: AUTH_FAIL, message: 'auth fail'};
    logger.info(req.body);
    var userReq = req.body;
    moduler.authentication(userReq.name, userReq.password, function (err, user) {
        if (err) {
            result.message = err.toString();
            logger.info('authenticate user fail. ', err);
        }
        else {
            result.result = SUCCESS;
            result.message = 'success';
            result.user = {name: user.name, username: user.username, group: user.group};
        }
        res.json(result);
    });
}


function getUser(req, res) {
    var name = req.param('user');
    logger.info(name);
    var result = {
        result: AUTH_FAIL,
        message: 'get User fail'
    };
    if (name != undefined || name != null || name != '') {

        var groupName;
        var leader = [];
        var result = {
            result: SUCCESS,
            message: 'success',
            user: {
                name: name,
                group: '',
                leader: []
            }
        };
        logger.info(AllUserList);
        for (var user in AllUserList) {
            if (AllUserList[user].account == name) {
                groupName = AllUserList[user].group;

                logger.info(groupName);
            }
        }
        for (var group in LeaderList) {
            if (groupName == group) {
                var tempLeaderList = LeaderList[group];
                for (var i = 0; i < tempLeaderList.length; i++) {
                    leader.push(tempLeaderList[i].account);
                }
            }
        }
        result.result = SUCCESS; // "result" : 0
        result.message = 'success';
        result.user.group = groupName;
        result.user.leader = leader;
    }
    res.json(result);

}

function updateConfig(req, res) {
    var result = {result: AUTH_FAIL, message: 'auth fail'};
    var updateLdap = getLdapConfig();
    updateLdap();
    if (updateLdap) {
        result.result = SUCCESS;
        result.message = 'success';
    }
    res.json(result);
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url: '/user/auth', method: "POST", process: authenticate},
        {url: '/user/info', method: "POST", process: getUser},
        {url: '/user/config', method: "POST", process: updateConfig},
        // {url : '/front/user/', method : "POST", process : createUser},
        // {url : '/front/user/', method : "PUT", process : updateUser},
        // {url : '/front/user/\:id', method : "DELETE", process : deleteUser},
        // {url : '/front/user/list', method : "GET", process : findUser},
        // {url : '/front/user/\:id', method : "GET", process : getUser},
    ];
};
