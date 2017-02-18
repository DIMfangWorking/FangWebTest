
var util = require("util");
var processClientMsg = require("./processClientMsg.js");
function processTaskRerunMsg() {
    processClientMsg.call(this);
}
util.inherits(processTaskRerunMsg, processClientMsg);
module.exports = processTaskRerunMsg;