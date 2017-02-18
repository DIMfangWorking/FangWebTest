var util = require("util");
var processClientMsg = require("./processClientMsg.js");

function processUpdateSlaveMsg() {
    processClientMsg.call(this);
}
util.inherits(processUpdateSlaveMsg, processClientMsg);
module.exports = processUpdateSlaveMsg;