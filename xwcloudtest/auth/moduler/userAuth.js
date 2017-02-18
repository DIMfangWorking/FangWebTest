var ldap = require('ldapjs');
var util = require('util');

var database = undefined;
var userCurrentIndex = undefined;

var errorMesage = {
    0x525: '用户不存在'
    , 0x52e: '密码或凭证无效'
    , 0x530: '此时不允许登陆'
    , 0x531: '在此工作站上不允许登陆'
    , 0x532: '密码过期'
    , 0x533: '账户禁用'
    , 0x701: '账户过期'
    , 0x773: '用户必须重置密码'
    , 0x775: '用户账户锁定'
};

function createLdapConnect(data, reslove, reject) {

    var ldapClient = ldap.createClient({
        url: data.user_config.url
        , connectTimeout: data.user_config.connect_timeout * 1000
        , idleTimeout: data.user_config.idle_timeout * 1000
        , timeout: data.user_config.search_timeout * 1000
    });

    ldapClient.bind(data.user_config.bind_dn,
        data.user_config.password, function (err) {
            if (err) {
                logger.error('connect ladp server error.', err);
                data.error = err;
                reject(data);
            }
            else {
                data.client = ldapClient;
                reslove(data);
            }
        });
}

function notifyView(data, reslove, reject) {
    if (data.error) {
        data.async(data.error, null);
        reject(data);
    }
    else {
        data.async(null, data.user);
        reslove(data);
    }
}

function searchUser(data, reslove, reject) {
    logger.info("searchUser start");

    data.client.search(data.user_config.search_base, data.query, function (err, res) {
        if (err) {
            logger.error('search fail. ', err);
            data.error = err;
            reject(data);
        }
        else {
            var callFlag = false;
            res.on('searchEntry', function (entry) {
                logger.debug(util.inspect(entry.object.dn, null, indet = 4));
                data.user = entry;
                reslove(data);
                callFlag = true;
            });

            res.on('searchReference', function (referral) {
            });

            res.on('error', function (err) {
                data.error = err;
                reject(data);
                callFlag = true;
            });

            res.on('end', function (result) {
                if (callFlag == false) {
                    data.error = 'not find user';
                    reject(data, null);
                }

                data.client.unbind();
            });
        }
    });
}

function auth(data, reslove, reject) {
    var ldapAuth = ldap.createClient({url: data.user_config.url});
    //logger.info("auth中" + JSON.stringify(data.user));
    ldapAuth.bind(data.user.object.dn, data.password, function (err) {
        if (err) {
            var result = err.message.match('data [0-9a-f]{3}')
            if (result) {
                errorcode = parseInt(result[0].split(' ')[1], 16);
                if (errorMesage[errorcode]) {
                    err = errorMesage[errorcode];
                    reslove(data);
                }
            }

            data.error = err;
            reslove(data);
        }
        else {
            var dn = ldap.parseDN(data.user.object.dn);
            logger.info("dn.rdns[0].cn : " + dn.rdns[0].cn + " " + dn.rdns[1].ou + " " + dn.rdns[0].cn);
            data.user.object.name = dn.rdns[0].cn;
            data.user.object.group = dn.rdns[1].ou;
            data.user.object.username = dn.rdns[0].cn;
            reslove(data)
        }
        ldapAuth.unbind();
    });
}

function authentication(user, password, callback) {
    logger.info("authentication 中的 " + user);
    var opt = {
        filter: '(sAMAccountName=' + user + ')'
        // filter : '(objectClass=group)'
        , scope: 'sub'
        , timeLimit: 500
    };
    logger.info("authentication 中的 " + JSON.stringify(opt));
    makePromise(loadLDAPConfig, {query: opt, password: password, async: callback})
        .then(makePromiseFunction(createLdapConnect), defaultErrorProcess)
        .then(makePromiseFunction(searchUser), defaultErrorProcess)
        .then(makePromiseFunction(auth), defaultErrorProcess)
        .then(makePromiseFunction(notifyView), makePromiseFunction(notifyView))
        .done(function (data) {
        }, function (data) {
            if (data.error)
                logger.info("authentication function. data : ", data.error);
        }, undefined);

    //var callFlag = false;
}
function loadLDAPConfig(data, reslove, reject) {
    database.UserManagerConfig.find().exec( function(err, transferedData){
        if (err) {
            logger.error('load ladp server error.', err);
            data.error = err;
            reject(data);
        }
        else {
            //logger.info('data中的数据.', transferedData);
            data.user_config =  transferedData[0].user_config;
            reslove(data);
        }
    });
}
module.exports = function (db) {
    database = db;

    return {
        'authentication': authentication
    };
}
