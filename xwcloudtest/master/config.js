module.exports = {
    master : {
        protocol : 'http',
        ip : '172.31.3.155',
        port : 3000,
        slave_heartbeat_timeout : 60,
        static_page_path : "web/static",
        completion_extend_path : "/home/xinwei/AutoTestSystem"
    },

    web_server : {
        protocol : 'http',
        // ip : '172.31.4.189',
        ip : '172.31.3.155',
        port : 80,
    },

    ci_database : {
        protocol: 'mysql',
        user:      'root',
        password:  '' ,
        host:     "172.31.2.28",
        database: "jira",
        port:     '3306',
        connectlimit : 10,
        acquireTimeout : 20 * 60 * 1000 
    },
    gatewayAmqp : {
        url : 'amqp://xinwei:123456@172.31.3.155',
        taskQueue : 'taskQueue',
        resourceQueue: 'resource',
    }
};