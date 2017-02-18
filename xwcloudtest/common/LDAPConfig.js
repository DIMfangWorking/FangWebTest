var ldap = require('ldapjs');
var util = require('util');

var database = undefined;

function createLdapConnect(data, reslove, reject)
{
    logger.info("createLdapConnect start");

    var ldapClient = ldap.createClient({
        url : data.config.ldap.url
        , connectTimeout : data.config.ldap.connect_timeout * 1000
        , idleTimeout : data.config.ldap.idle_timeout * 1000
        , timeout : data.config.ldap.search_timeout * 1000});

    ldapClient.bind(data.config.ldap.bind_dn,
        data.config.ldap.password, function(err){
            if (err)
            {
                logger.error('connect ladp server error.', err);
                data.error = err;
                reject(data);
            }
            else
            {
                data.client = ldapClient;
                reslove(data);
            }
        });
}

function findAllUser(data, reslove, reject)
{
    logger.info("find All User start");
    var opt = {
        // filter : '(name=*)|'
        filter : '(|(&(objectClass=group)(cn=jira-leaders))(objectClass=person))'
        , scope : 'sub'
        , timeLimit : 500 };

    var callFlag = false;
    data.client.search(data.config.ldap.search_base, opt, function(err, res){
        if (err)
        {
            logger.error('search fail. ', err);
            data.error = err;
            reject(data);
        }
        else
        {
            var callFlag = false;

            data.userlist = [];

            res.on('searchEntry', function(entry){
                callFlag = true;

                logger.debug(util.inspect(entry.object, null, indet = 4));

                entry.object.objectClass.forEach(function(item){
                    if (item == 'person')
                    {
                        data.userlist.push(entry.object);
                    }
                    else if (item == 'group')
                    {
                        data.group = entry.object;
                    }
                });
            });

            res.on('searchReference', function(referral){
            });

            res.on('error', function(err){
                data.error = err;
                reject(data);
                callFlag = true;
            });

            res.on('end', function(result){
                if (callFlag == false){
                    data.error = 'not find user';
                    reject(data);
                }
                else
                {
                    reslove(data);
                }
            });
        }
    });
}

function managerAllUser(data, reslove, reject)
{
    logger.info("manager All User start");
    data.UserGroup = {};
    data.UserList = {};
    data.UserNameList = [];
    data.UserCNList = {};
    data.LeaderGroup = {};
    logger.debug('userlist ', data.userlist.length);
    data.userlist.forEach(function(user){
        var dn = ldap.parseDN(user.dn);
        var userObj = {};

        userObj.name = dn.rdns[0].cn;
        userObj.account = user.sAMAccountName;
        userObj.group = dn.rdns[1].ou;
        userObj.username = dn.rdns[0].cn;
        userObj.email = user.mail;

        data.UserList[user.sAMAccountName] = userObj;
        data.UserCNList[userObj.name] = userObj;
        data.UserNameList.push(user.sAMAccountName);
    });

    data.group.member.forEach(function (mem) {
        var gdn = ldap.parseDN(mem);

        var cn = gdn.rdns[0].cn;
        var ou = gdn.rdns[1].ou;
        if(data.LeaderGroup[ou])
        {
            data.LeaderGroup[ou].push(data.UserCNList[cn]);
        }
        else
        {
            data.LeaderGroup[ou] = [data.UserCNList[cn]];
        }
        logger.debug(util.inspect(data.LeaderGroup, null, indet = 4));
    });

    reslove(data);
}

function UpdateLDAP(config)
{
    makePromise(createLdapConnect, { config : config })
        .then(makePromiseFunction(findAllUser), defaultErrorProcess)
        .then(makePromiseFunction(managerAllUser), defaultErrorProcess)
        .done(function (data) {
            logger.debug(util.inspect(data.UserList, null, indet = 4));
            global.AllUserList = data.UserList;
            global.LeaderList = data.LeaderGroup;
            global.AllUserNameList = data.UserNameList;
            logger.debug(util.inspect(AllUserNameList, null, indet = 4));
            data.client.unbind();
        }, function (data) {
            logger.debug(util.inspect(data, null, indet = 4));
            try{
                data.client.unbind();
            }catch(e){}
            if (data.error)
                logger.info("authentication function. data : ", data.error);
            process.exit(-1);
        }, undefined);
}

module.exports = {createLdapConnect : createLdapConnect
    , findAllUser : findAllUser
    , managerAllUser : managerAllUser
    , UpdateLDAP : UpdateLDAP
};

if (module == require.main)
{
    var ldap = {
        url : 'ldap://172.31.2.1:389' ,
        bind_dn : 'CN=Administrator,CN=Users,DC=xa,DC=xinwei,DC=com' ,
        password : 'XWadmin89522929' ,
        search_base : 'OU=xateam,DC=xa,DC=xinwei,DC=com',
        connect_timeout : 10,   // unit second
        idle_timeout : 3,
        search_timeout : 60,
    }

    UpdateLDAP({ldap:ldap});
}