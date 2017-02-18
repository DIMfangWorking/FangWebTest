var log4js = require('log4js');
var util = require('util');
var comm = require('./common/app');

var express = require('express');
var app = express();

app.use(log4js.connectLogger(logger, {level: 'auto', format:':method :url content-type::req[Content-Type]'
  , nolog : ["/master/update","/slave/update","/UE/BandWitdth","\\.ico","\\.css","\\.js","\\.png","\\.jpg"
            ,"\\.gif","\\.otf","\\.eot","\\.svg","\\.ttf","\\.woff","\\.woff2","\\.svg"]}));

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer'); 

/*
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
*/

var upload = multer({dest : config.ftp.real_path, onFileUploadStart: function (file) {
    console.log( "upload start. file : ", file.originalname);
    return true;
}, onFileUploadComplete: function (file) {
    logger.info( "upload complete. file : ", file.originalname);
}});

app.use(cookieParser());
app.use(bodyParser.json({limit : 50 * 1024 * 1024})); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(upload); // for parsing multipart/form-data

var router = control(app,express);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.json({result: ERROR});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error(err);
  // logger.error(util.inspect(err.stack, { showHidden: true, depth: 5 }));
  res.status(err.status || 500);
  res.json({result: ERROR});
});

process.on('uncaughtException', function(err) {
  logger.error(err);
  // logger.error(util.inspect(err.stack, { showHidden: true, depth: 5 }));
});

/*
var cluster = require('cluster');

if (cluster.isMaster)
{
	for (var i = 0; i < 5; i++) {
    cluster.fork();
  }

  cluster.on('listening', function(worker, address) {
    logger.info("A worker is now connected to " + address.address + ":" + address.port);
  });

  cluster.on('exit', function(worker, code, signal) {
    logger.info('worker ' + worker.process.pid + ' died');
    setTimeout(function () { cluster.fork(); }, 2000);
  });
}
else
{
  app.listen(config[global.part].port,function(){
    logger.info(global.part + " start");
  });
}
*/

app.listen(config[global.part].port,function(){
  logger.info(global.part + " start");
});