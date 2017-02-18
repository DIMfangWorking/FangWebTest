var ldap = require('ldapjs');
var util = require('util');

function init(config) {
    //console.info('makePromise', makePromise);
    //console.info('global', util.inspect(global, null, indet = 4));
    // makePromise(createLdapConnect, { config : config })
    //     .then(makePromiseFunction(findAllUser), defaultErrorProcess)
    //     .then(makePromiseFunction(managerAllUser), defaultErrorProcess)
    //     .done(function (data) {
    //           //logger.info(util.inspect(data.UserList, null, indet = 4));
    //         global.AllUserList = data.UserList;
    //         global.LeaderList = data.LeaderGroup;
    //         logger.debug(util.inspect(AllUserList, null, indet = 4));
    //           data.client.unbind();
    //        }, function (data) {
    //           logger.debug(util.inspect(data, null, indet = 4));
    //           data.client.unbind();
    //           if (data.error)
    //             logger.info("authentication function. data : ", data.error);
    //           process.exit(-1);
    //        }, undefined);
}

if (module == require.main) {
    logger.info(require.main);
    // var promiseUtil = require('./common/promiseUtil');
    // var makePromise = promiseUtil.makePromise;
    // var makePromiseFunction = promiseUtil.makePromiseFunction;
    // var defaultProcess = promiseUtil.defaultProcess;
    // var defaultErrorProcess = promiseUtil.defaultErrorProcess;

    // var config = {
    //     ldap : {
    //         url : 'ldap://172.31.2.1:389' ,
    //         bind_dn : 'CN=Administrator,CN=Users,DC=xa,DC=xinwei,DC=com' ,
    //         password : 'XWadmin89522929' ,
    //         search_base : 'OU=xateam,DC=xa,DC=xinwei,DC=com',
    //         connect_timeout : 10,   // unit second
    //         idle_timeout : 3,
    //         search_timeout : 60
    //     }
    // };

    // var logger = console;

    // init(config);
}
else {
    //init(config);
    // ldapconfig.UpdateLDAP(config);
}

module.exports = init;
