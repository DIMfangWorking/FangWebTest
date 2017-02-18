var util = require("util");
var processClientMsg = require("./processClientMsg.js");
function processTaskResultMsg() {
    processClientMsg.call(this);
}
util.inherits(processTaskResultMsg, processClientMsg);
module.exports = processTaskResultMsg;