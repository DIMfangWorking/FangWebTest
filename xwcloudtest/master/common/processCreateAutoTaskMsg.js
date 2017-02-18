var util = require("util");
var processClientMsg = require("./processClientMsg.js");

function processCreateAutoTaskMsg() {
    processClientMsg.call(this);
}
util.inherits(processCreateAutoTaskMsg, processClientMsg);
module.exports = processCreateAutoTaskMsg;