module.exports = {
    master : {
        protocol : 'http',
        ip : '172.31.3.155',
        port : 3000,
    },

    slave : {
        protocol : 'http',
        ip : 'cloud.xa.com',
        port : 4000,
        gateway : '172.31.3.254',
        task_report_interval : 2 * 1000,    /* 2 second */
        temp_path : '/home/xinwei/testtask/', /* 临时存放日志，测试用例的目录 */
        testframwrok_path : '/home/xinwei/code/testframework/',   /* 测试框架路径 */
    },

    slave_ue : {
        protocol : 'http',
        ip : '172.31.3.155',
        port : 3000,
    },

    sim_slave : {
       code_prefetch : {
           user : 'guowei',
           password : '123456',
           path : 'http://svn.xa.com/svn/LTE_CODE/branches/trunk/codebts',
           copies : 5
       },
       docker : {
           protocol : 'http',
           ip : '172.17.42.1',
           port : 4243,
           image : 'ci-build5',
           rm : true,                      /* Automatically remove the container when it exits */
       }
    },

    // real_slave : {

    // }
};