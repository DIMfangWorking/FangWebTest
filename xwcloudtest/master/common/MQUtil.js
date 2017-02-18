/**
 * Use Message Queue(rabbitMQ) to communicate
 */
var dispatcherFactory = require("./dispatcherFactory.js");
var processClientMsgFactory = require("./processClientMsgFactory.js");
function MQUtil(messageQueue) {

    var dispatcher = dispatcherFactory.createDispatcher('slave');

    // receive from the other side
    this.msgQServer = function (queueName) {
        messageQueue.startRpcServer(queueName, function (err, msg, callback) {
            var msgObj = JSON.parse(msg.content);
            logger.info(msgObj);
            dispatcher.dispatch(msgObj, callback);

        });
    }
    // send
    this.sendRequestByRPC = function (messageId, requestBody, queueName, callback) {
        messageQueue.startRpcClient();
        var processClientMsg = processClientMsgFactory.createMsgProcessFunction(messageId)
        processClientMsg.processMsg(messageQueue, messageId, requestBody, queueName, callback);
    }
}
module.exports = MQUtil;
