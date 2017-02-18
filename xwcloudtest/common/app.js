global.part = process.argv[process.argv.length - 1];

function usage()
{
    console.error("npm start web|master|slave|auth");
}

switch(part)
{
    case 'web':
    case 'master':
    case 'slave':
    case 'auth':
        break;
    default:
        usage();
        process.exit(0);
        break;
}

var path_module = require('path');

var loadConfig = require('./loadConfig');
global.config = loadConfig();
var DBSetOptionParse = require('./DBSetOptionParse');
var promiseUtil = require('./promiseUtil');
var autoLoadModule = require('./autoLoadModule');
var sendHttpRequest = require('./httpRequest');
var statusmachine = require('./statusmachine');

var ldapconfig = require('./LDAPConfig');

var model = require('./dbModel');
var control = require('./control');
var logger = require('./logger');
var clone = require('./clone');
var Mail = require('./sendmail');
var DBPluggin = require('./DBPluggin');
var MsgQueue = require('./MsgQueue');
var LDAPUpdate = require('./LDAPUpdate');
var loadEiConfig = require('./loadEIConfig');
/* reslut code */
global.SUCCESS = 0;
global.ERROR = -1;
global.AUTH_FAIL = -2;

/* String constant */
global.STATUS_LOST = 'lost';
global.STATUS_NORMAL = 'normal';

global.RESOURCE_TYPE_SIM = 'simulation';
global.RESOURCE_TYPE_REAL = 'real';

global.RESOURCE_STATUS_IDLE = 'idle';
global.RESOURCE_STATUS_BUSY = 'busy';

global.TASK_STATUS_RUN = 'run';
global.TASK_STATUS_CLOSE = 'close';

global.RESULT_SUCCESS = 'success';
global.RESULT_FAIL = 'fail';

/* pwd */
global.pwd = path_module.dirname(path_module.dirname(module.filename));

global.logger = logger;

global.autoLoadModule = autoLoadModule;
global.sendHttpRequest = sendHttpRequest;

global.DBSetOptionParse = DBSetOptionParse;
global.makePromise = promiseUtil.makePromise;
global.makePromiseFunction = promiseUtil.makePromiseFunction;
global.defaultProcess = promiseUtil.defaultProcess;
global.defaultErrorProcess = promiseUtil.defaultErrorProcess;

global.ldapconfig = ldapconfig;

global.startStatusMachine = statusmachine;
global.clone = clone;

global.loadEiConfig = loadEiConfig;
global.Mail = Mail;

global.model = model;
global.control = control;

/*
* Used in updating the LDAP, 
* auth/dao set the database 
* then callback the function in auth/app.js which is findLDAPInfo() 
*/
global.dbInitialComplete = DBPluggin.dbInitialComplete;
global.getAuthDaoInit = DBPluggin.getAuthDaoInit;

global.MsgQueue = MsgQueue;
/*
* Used in updating the LDAP at auth/view/userAuth
* 
*/
global.setLdapConfig = LDAPUpdate.setLdapConfig;
global.getLdapConfig = LDAPUpdate.getLdapConfig;


module.exports = {};