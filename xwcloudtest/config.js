module.exports = {
    database : {
       protocol : 'mongodb',
       ip : '172.31.3.155',
       port : '27017',
       db_name : 'xwcloudtest'
    },

    cache : {
        protocol : 'redis',
        ip : '172.31.3.155',
        port : '6379'
    },

    ftp : {
        ip : '172.31.3.155',
        port : 21,
        user : 'xwcloudtest',
        password : '123456',
        upload_path : 'logs',
        real_path : '/home/xwcloudtest'    // 从web页面传上来的文件，不可能再次传输到ftp上，所以，这里直接将文件放到ftp目录下。
    },

    syslog : {
        protocol : 'udp',
        ip : '172.31.3.155',
        port : 515
    },
};

/*
ldap : {
 url : 'ldap://172.31.2.1:389' ,
 bind_dn : 'CN=Administrator,CN=Users,DC=xa,DC=xinwei,DC=com' ,
 password : 'XWadmin89522929' ,
 search_base : 'OU=xateam,DC=xa,DC=xinwei,DC=com',
 connect_timeout : 10,   // unit second
 idle_timeout : 3,
 search_timeout : 60,
 update_time : '02:00:00',
 last_updatetime : '12:35:00'
}
 */