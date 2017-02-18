/**
 *
 * A factory that can process different RPC client MSG
 */
var processCreateTaskMsg = require('./processCreateTaskMsg.js');
var processTaskResultMsg = require('./processTaskResultMsg.js');
var processTaskReportMsg = require('./processTaskReportMsg.js');
var processTaskRerunMsg = require('./processTaskRerunMsg.js');
var processCreateAutoTaskMsg = require('./processCreateAutoTaskMsg.js');
var processUpdateSlaveMsg = require('./processUpdateSlaveMsg.js');

exports.createMsgProcessFunction = function (whichClient) {
    switch (whichClient) {
        case 'create task' :
            return new processCreateTaskMsg();
            break;
        case 'result task' :
            return new processTaskResultMsg();
            break;
        case 'report task' :
            return new processTaskReportMsg();
            break;
        case 'rerun auto task' :
            return new processTaskRerunMsg();
            break;
        case 'create auto task' :
            return new processCreateAutoTaskMsg();
            break;
        case 'beatheart slave' :
            return new processUpdateSlaveMsg();
            break;
    }
}