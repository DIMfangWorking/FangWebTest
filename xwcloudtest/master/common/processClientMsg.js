/**
 * just a processMsg interface
 */
function processClientMsg() {
    /**
     * receive the message from server side
     * @param mq queue
     * @param message Id
     * @param requestBody request
     */
    this.processMsg = function (messageQueue, messageId, requestBody, queueName, callback) {
        if (!messageQueue.checkConnectStat()) {
            setTimeout(this.processMsg, 500, messageQueue, messageId, requestBody, queueName, callback);
            return;
        }
        messageQueue.callRpcMethod(queueName, messageId.toString(), new Buffer(JSON.stringify(requestBody)), function (err, msg) {
            logger.info("msg : " + msg.content);
            callback(err, msg.content);
        });
    }
}
module.exports = processClientMsg;