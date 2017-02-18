#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

/**
 *
 * @param opt just is URL
 * @constructor
 */
function MsgQueue(opt) {

    var rabbitmq = {};
    rabbitmq.callback = {};
    this.generateUuid = function () {
        return Math.random().toString() +
            Math.random().toString() +
            Math.random().toString();
    }
    /**
     *
     * @param url localhost or other hosts
     */
    function rabbitmq_init(url) {
        amqp.connect(url, function (err, conn) {
            if (err) {
                console.log(err);
                return;
            }

            rabbitmq.connect = conn;

            conn.createChannel(function (err, ch) {
                if (err) {
                    console.log(err);
                    return;
                }
                rabbitmq.channel = ch;
            });
        });
    }

    this.checkConnectStat = function () {
        return (!!rabbitmq.connect && !!rabbitmq.channel && !!rabbitmq.queue);
    }

    /*
     rpc client 部分
     */
    var rpcClientRecvFlag = false;
    var self = this;
    this.startRpcClient = function () {
        if (rpcClientRecvFlag) {
            return;
        }

        if (!rabbitmq.channel) {
            setTimeout(self.startRpcClient, 50);
            return;
        }

        rpcClientRecvFlag = true;

        rabbitmq.channel.assertQueue('', {exclusive: true}, function (err, q) {
            rabbitmq.queue = q;
            rabbitmq.queue_name = q.queue;
            rabbitmq.channel.consume(q.queue, function (msg) {
                try {
                    rabbitmq.callback[msg.properties.correlationId](null, msg);
                    delete rabbitmq.callback[msg.properties.correlationId];
                } catch (e) {
                    console.log(e);
                }
            }, {noAck: true});
        });
    }

    this.callRpcMethod = function (queueName, msgId, body, cb) {
        var corr = this.generateUuid();

        rabbitmq.callback[corr] = cb;

        rabbitmq.channel.sendToQueue(queueName, body,
            {messageId: msgId, correlationId: corr, replyTo: rabbitmq.queue.queue});
    }

    /*
     rpc server 部分
     */
    var rpcServerRecvFlag = false;
    this.startRpcServer = function (queue_name, cb) {
        if (rpcServerRecvFlag) {
            return;
        }

        if (!rabbitmq.channel) {
            setTimeout(self.startRpcServer, 50, queue_name, cb);
            return;
        }
        rpcServerRecvFlag = true;

        rabbitmq.queue_name = queue_name;

        rabbitmq.channel.assertQueue(queue_name, {durable: false}, function (err, q) {
            rabbitmq.queue = q;
        });
        rabbitmq.channel.prefetch(1);

        rabbitmq.channel.consume(queue_name, function (msg) {
            cb(null, msg, function (err, message) {
                if (err) {
                    console.log("err : " + err);
                } else {
                    var tempMsg = JSON.stringify(message);
                    rabbitmq.channel.sendToQueue(msg.properties.replyTo,
                        new Buffer(tempMsg),
                        {correlationId: msg.properties.correlationId});
                    rabbitmq.channel.ack(msg);
                }
            });
        });
    };
    rabbitmq_init(opt.url);

}

module.exports = MsgQueue;

if (require.main === module) {
    var args = process.argv.slice(2);
    var mq = new MsgQueue({url: 'amqp://xinwei:123456@172.31.3.155'});
    if (args.length == 0) {
        console.log("Usage: rpc_client.js num");
        process.exit(1);
    }
    function processMsg(mq, num) {
        if (!mq.checkConnectStat()) {
            setTimeout(processMsg, 500, mq, num);
            return;
        }
        console.log('start')
        var taskData = {
            accessInformation: {port: 7609, hostname: '172.31.3.175', method: 'post', url: '/master/task'},
            data: {id: 09122360}
        };
        var taskDataString = JSON.stringify(taskData);
        mq.callRpcMethod('gateway', "123123", new Buffer(taskDataString), function (err, msg) {
            console.log('got ....' + msg.content);
        });
        //setTimeout(processMsg, 50, mq, 1 + num);
    }

    /*
     console.log(' [x] Awaiting taskQueue RPC requests');
     mq.startRpcServer('resourceQueue', function (err, msg){
     try{
     console.log(' [x] message is ' + msg.properties.correlationId);
     return msg.properties.correlationId;
     }catch(e){
     console.log(e)
     return 0;
     }
     });*/

    mq.startRpcClient();

    processMsg(mq, parseInt(args[0]));
}