var schedule = require('node-schedule');
var common = require('./common/app.js');
var userData;
function init(app,express)
{
    // app.use(session({
    //     store: new RedisStore({host:config.cache.ip, port:config.cache.port, db: 'session'}),
    //     secret: 'keyboard cat',
    //     cookie: { maxAge: config.web.session_timeout }
    // }));
    common.setStatus('init');

    function findLDAPInfo(db) {
        db.UserManagerConfig.findOne({"Type" : "LDAP"}).exec(function(err, data){
            if(err)
            {
                logger.info('find LDAP error !', err);
                whenError();

            }
            if(data)
            {
                logger.info('find LDAP success !');
                userData = data;
                config.ldap = data.user_config;
                afterSuccess(ldapconfig.UpdateLDAP);
                ldapconfig.UpdateLDAP(config);
                common.setStatus('running');
                logger.info('running success !');
            }
        });
    }
    function updatingLDAP() {
        logger.info('验证重新刷新');
        logger.info(userData);
        config.ldap = userData.user_config;
        ldapconfig.UpdateLDAP(config);
    }

    function afterSuccess(updateLDAP) {
        logger.info('execUpdating');
        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(config.updateTime.startDay, config.updateTime.endDay)];
        rule.hour = config.updateTime.hour;
        rule.minute = config.updateTime.minute;
        var execUpdate = schedule.scheduleJob(rule, function() {
            updateLDAP(config);
            logger.info('execUpdate success !');
        });
    }

    function whenError() {
        var rule = new schedule.RecurrenceRule();
        rule.second = config.updateTime.timeInterval;
        var execUpdate = schedule.scheduleJob(rule, function() {
            findLDAPInfo();
        });
    }
    
    // Used in Dao layer callback findLDAPInfo(db) when dao finished connecting the mongo    
    dbInitialComplete(findLDAPInfo);
    // Used in view/userAuth 
    setLdapConfig(updatingLDAP);

    return undefined;
}
module.exports = init;
