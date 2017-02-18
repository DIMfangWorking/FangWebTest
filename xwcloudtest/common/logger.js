var util = require('util');
var path = require('path');
var log4js = require('log4js');

var dateFormat = require('./date_format')

function wrapErrorsWithInspect(items) {
  return items.map(function(item) {
    if ((item instanceof Error) && item.stack) {
      return { inspect: function() { return util.format(item) + '\n' + item.stack; } };
    } else {
      return item;
    }
  });
}

function formatLogData(logData) {
  var data = Array.isArray(logData) ? logData : Array.prototype.slice.call(arguments);
  return util.format.apply(util, wrapErrorsWithInspect(data));
}

function prepareStackTrace(error, structuredStackTrace) {
  if (structuredStackTrace.length < 10)
  {
    return structuredStackTrace;
  }

  var trace = structuredStackTrace[10];

  return {
    // method name
    name: trace.getMethodName() || trace.getFunctionName() || trace.getFunction() || "<anonymous>",
    // file name
    file: path.basename(trace.getFileName()),
    // line number
    line: trace.getLineNumber(),
    // column number
    column: trace.getColumnNumber()
  };
}

function getTrace(caller) {
  var original = Error.prepareStackTrace,
      error = {};
  Error.captureStackTrace(error, caller || getTrace);
  Error.prepareStackTrace = prepareStackTrace;
  var stack = error.stack;
  Error.prepareStackTrace = original;
  return stack;
}

var layout = {
        type: "pattern",
        pattern: "%[%x{prefix}%]%m",
        tokens: {
          "prefix" : function(loggingEvent, timezoneOffest) {
            var position = getTrace(loggingEvent)

            var output = formatLogData('[%s] [%s] [%s:%d] %s - '
              , dateFormat.asString(loggingEvent.startTime, timezoneOffest)
              , loggingEvent.level
              , position.file, position.line
              , loggingEvent.categoryName);

          return output; }
        }
      };

log4js.configure({
  appenders: [
    {
      type: 'console',
      layout: layout
    },
    {
      type: 'file',
      filename: 'logs/' + global.part + '.log', 
      maxLogSize: 20 * 1024 * 1024,
      backups: 4,
      category: global.part,
      layout: layout
    }
  ]
});

var logger = log4js.getLogger(global.part);
//logger.setLevel('DEBUG');
logger.setLevel('INFO');

module.exports = logger;
