module.exports = {
    web : {
        port : 80,
        welcome_page : 'index.html',
        home_page : 'homepage.html',
        session_timeout : 24 * 7 * 60 * 60 * 1000 , /* 30 min */
        master_heartbeat_timeout : 60 ,   /* 60 seconds */
        filter : ["auth", "uploadFileFilter", "static", "master"],
        static_page_path : "web/static"
    },
    auth : {
        port : 8011,
        ip : '172.31.4.7'
    },
};