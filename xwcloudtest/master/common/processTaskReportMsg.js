var util = require("util");
var processClientMsg = require("./processClientMsg.js");
function processTaskReportMsg() {
    processClientMsg.call(this);
}
util.inherits(processTaskReportMsg, processClientMsg);
module.exports = processTaskReportMsg;
