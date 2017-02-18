var util = require("util");
var processClientMsg = require("./processClientMsg.js");
function processCreateTaskMsg() {
    processClientMsg.call(this);
}
util.inherits(processCreateTaskMsg, processClientMsg);
module.exports = processCreateTaskMsg;