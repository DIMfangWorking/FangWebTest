/**
 * dispatch the request from task(another micro service) to slaves executing
 */
var util = require("util");
var dispatcher = require("./dispatcher.js");
var Verify = require("./Verify");
function dispatcherToSlaves() {
    var optionsData = {
        port: -1,
        hostname: '',
        method: '',
        path: '',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };
    global.optionsJsonData = optionsData;
    function sendHttpReq(data, callback) {
        var result = {"result": ERROR, message: "not found resource"};
        sendHttpRequest(optionsJsonData, JSON.stringify(data), function (err, res, chunk) {
            if (err) {
                logger.error(err);
                callback(err, result)
            } else {
                logger.info("chunk : " + chunk);
                result.result = SUCCESS;
                result.message = 'Success';
                result.data = chunk;
                logger.info(JSON.stringify(result));
                callback(null, result);
            }
        });
    }

    this.dispatch = function (request, callback) {
        if (request.accessInformation.length > 1) {
            request.accessInformation.foreach(function (info) {
                if (Verify.verifyInfo(info)) {
                    sendHttpReq(request.data, callback);
                }
            });
        } else {
            if (Verify.verifyInfo(request.accessInformation)) {
                sendHttpReq(request.data, callback);
            }
        }
    }
}
util.inherits(dispatcherToSlaves, dispatcher);
module.exports = dispatcherToSlaves;