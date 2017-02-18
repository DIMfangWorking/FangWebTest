var util = require('util');

module.exports = function(app,express) {
    var trace = null;
    if (logger)
    {
        trace = logger;
    }
    else
    {
        trace = console;
    }

    if (global.part === 'master') {
        var init = require('../' + global.part + '/app');
        var filter = init(app,express);

        var dao = require('../' + global.part + '/dao/app')();

        var moduler = require('../' + global.part + '/gateway/gwmoduler/app')(dao);

        var view = require('../' + global.part + '/gateway/gwview/app')(moduler);
    } else {
        var init = require('../' + global.part + '/app');
        var filter = init(app,express);

        var dao = require('../' + global.part + '/dao/app')();

        var moduler = require('../' + global.part + '/moduler/app')(dao);

        var view = require('../' + global.part + '/view/app')(moduler);
    }
    if (util.isArray(filter))
    {
        var parm = {app : app, express : express, dao:dao, moduler : moduler, view:view}
        filter.forEach(function (item){
            filterObj = require('../' + global.part + '/filter/'+item+'.js')(parm);
            app.use(filterObj);
        });
    }

    view.forEach(function (item, index) {
        if (item.param != undefined)
            item.param(app);
        try
        {
            trace.info("register url : " + item.url + " method : " + item.method + " process : " + typeof(item.process));

            app[ item.method.toLowerCase() ](item.url, item.process);
        }
        catch(e)
        {
            logger.info("view : ", view);
        }
    });
}
