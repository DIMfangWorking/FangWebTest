module.exports = function (db) {
    var moduleObject = {};

    var moduleArray = autoLoadModule(pwd + "/slave/common/sim");

    moduleArray.forEach(function(item) {
       var loadObj = item(db);
       for (var key in loadObj)
       {
           moduleObject[key] = loadObj[key];
       }
    });

    return moduleObject;
};