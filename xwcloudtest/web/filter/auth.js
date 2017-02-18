var parm = undefined;
var viewfilter = {};
const util = require('util');
var parseUrl = require('parseurl');
var path = require('path');

function filter(req, res, next) {
        //logger.info('request Route: ', req.route);
        //logger.info(util.inspect(req,{showHidden : true , depth :1}));
        if (req.originalUrl == '/')
        {
            //logger.info('request again : ', '******************************');
            if (!req.session.username)
            {
                logger.info('not loging : ', req.ip);
                res.redirect(config.web.welcome_page);
                res.end();
            }
            else
            {
                if (req.session.ip == req.ip) {
                    res.redirect(config.web.home_page);
                    res.end();
                }
                else {
                    res.redirect(config.web.welcome_page);
                    res.end();
                }
            }
        }
        else
        {
            var item = viewfilter[req.route.path];
            if (item)
            {
                if (item.auth)
                {
                    if (!req.session.username)
                    {
                        logger.info('not loging : ', req.ip);
                        if (req.is('json'))
                        {
                            next();
                        }
                        else
                        {
                            res.redirect(config.web.welcome_page);
                            res.end();
                        }
                    }
                    else
                    {
                        next();
                    }
                }
                else
                {
                    next();
                }
            }
            else
            {
                next();
            }

        }
}

function rootFliter(req, res, next){
    //logger.info('path', path.extname(parseUrl(req).pathname));
    //logger.info('path1', req.originalUrl);
    Path = parseUrl(req).pathname;
    if(path.extname(Path) == '.html')
    {
        if(req.session.username)
        {
            next();
        }
        else
        {
            if(path.basename(Path) == 'index.html')
            {
                next();
            }
            else
            {
                global.originalreq= req.originalUrl;
                res.redirect(config.web.welcome_page);
                res.end();
            }
        }
    }
    else
    {
        next();
    }
}

module.exports = function(par){
    parm = par;

    var route = par.express.Router();

    route.use(rootFliter);
    route.route('/').all(filter);

    parm.view.forEach(function (item) {
        try
        {
            logger.info("register url : " + item.url + " method : " + item.method + " process : " + typeof(item.process) + "auth : " + item.auth);
            var itemlist = {};
            itemlist.method = item.method.toLowerCase();
            itemlist.process = item.process;
            itemlist.auth = item.auth;

            viewfilter[item.url] = itemlist;

            route[ item.method.toLowerCase() ](item.url, filter);
        }
        catch(e)
        {
            logger.info("view : ", parm.view);
        }
    });

    //route.use(par.express.static('web/static', {index : false}), filter);

    return route;
}