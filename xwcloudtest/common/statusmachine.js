/* status machine */
var os = require('os');
var master = config.master;

global.state = { id : 0, status : 'lost', count : 0, data : undefined };

function updateOfMaster(para, callback)
{
    logger.debug("update function start ");
    var postData = para.getUpdateData();

    var options = {
        port: para.port,
        hostname: para.ip,
        method: 'POST',
        path: para.updatePath,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    sendHttpRequest(options, postData, function (err, res, chunk) {
        if (err)
        {
            state.count ++;
            if (state.count >= 5)
            {
                logger.info("server status lost ");
                state.status = 'lost';
                state.count = 0;
            }
            logger.error('update problem with request: ' + err.message);
            return ;
        }

        var result = { result : ERROR };
        try {
            result = JSON.parse(chunk);
        }catch(e){
            logger.error('json.parse error. ', chunk);
        }

        if (result.result != SUCCESS)
        {
            state.count ++;
            if (state.count >= 5)
            {
                logger.info("server status lost ");
                state.status = 'lost';
                state.count = 0;
            }
        }
        else
        {
            //logger.info("update success");
            state.count = 0;
            callback(result);
        }
    });
}

function registrationOfMaster(para, callback)
{
    var postData = para.getRegData();

    var options = {
        port: para.port,
        hostname: para.ip,
        method: 'POST',
        path: para.regPath,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    sendHttpRequest(options, postData, function (err, res, chunk) {
        if (err)
        {
            logger.error('register problem with request: ' + err.message);
            return;
        }

        var result = { result : ERROR }
        try {
            result = JSON.parse(chunk);
        }catch(e){
            logger.error('json.parse error. ', chunk);
        }

        if (result.result != SUCCESS)
        {
            logger.error('register fail.');
        }
        else
        {
            logger.info("register success. id : ", result[para.key]);
            state.id = result[para.key];
            state.status = 'normal';
            callback(result);
        }
    });
}

function StatusMachine(para, callback)
{
    switch (state.status)
    {
        case 'lost':
            registrationOfMaster(para, callback);
            break;
        case 'normal':
            updateOfMaster(para, callback);
            break;
    }

    setTimeout(StatusMachine, 2000, para, callback);
}

function startStatusMachine(para, callback)
{
    StatusMachine(para, callback);
}

module.exports = startStatusMachine;

// module.exports = function StatusMachine(timeout) {
//     this.State = 'lost';
//     this.StateSwitchingTimeout = timeout;
//     this.action = function () {this.State = 'lost';};
// };

// StatusMachine.prototype = {
//     isLost : function () {
//         return this.State == 'lost';
//     },

//     isNormal : function () {
//         return this.State == 'normal';
//     },

//     getState : function () {
//         return this.State;
//     },

//     eventReg : function (obj)
//     {
//         if (this.timerObject)
//             clearTimeout(this.timerObject);

//         for (var key in obj)
//         {
//             this[key] = obj[key];
//         }

//         this.timerObject = setTimeout(this.action, this.StateSwitchingTimeout);
//     },

//     eventUpdate : function (obj)
//     {
//         if (this.timerObject)
//             clearTimeout(this.timerObject);

//         for (var key in obj)
//         {
//             this[key] = obj[key];
//         }

//         this.timerObject = setTimeout(this.action, this.StateSwitchingTimeout);
//     },

//     toString : function () {
//         return 'state is ' + this.State;
//     },
// };