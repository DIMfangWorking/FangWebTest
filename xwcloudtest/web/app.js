var session = require('express-session');
var RedisStore = require('connect-redis')(session);

function init(app,express)
{
    // app.use(session({
    //     store: new RedisStore({host:config.cache.ip, port:config.cache.port, db: 'session'}),
    //     secret: 'keyboard cat',
    //     cookie: { maxAge: config.web.session_timeout }
    // }));

    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: config.web.session_timeout }
    }));

    if (global.part == 'web')
    {

    }
    return config.web.filter;
}

module.exports = init;