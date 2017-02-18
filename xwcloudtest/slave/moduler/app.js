module.exports = function (db) {
    var moduleObject = {};

    function setModule(item) {
       var loadObj = item(db);
       for (var key in loadObj)
       {
           moduleObject[key] = loadObj[key];
       }
    };

    var task = require('./task');
    var con = require('./config');

    setModule(task);
    setModule(con);

    return moduleObject;
};