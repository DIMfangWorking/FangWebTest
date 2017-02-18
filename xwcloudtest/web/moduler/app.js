module.exports = function (db) {
    var moduleObject = {};
    var moduleArray = autoLoadModule(pwd + "/web/moduler");

    moduleArray.forEach(function(item) {
       //console.log('moduler item :', item);
       var loadObj = item(db);
       for (var key in loadObj)
       {
           moduleObject[key] = loadObj[key];
       }
    });

    return moduleObject;
};
