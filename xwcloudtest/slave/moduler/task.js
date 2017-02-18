var util = require("util");
var platFunction = {};

function createTask (task,callback)
{
    var taskObj = {};

    platFunction.createTask(task, callback);

    return ; 
}

function getTask(task, callback)
{

}

module.exports = function (db) {
    var moduleObject = {};

    var plat = getPlatformLib();
    var moduleArray = autoLoadModule(pwd + "/slave/moduler/" + plat);

    moduleArray.forEach(function(item) {
        var loadObj = undefined;
        if (util.isFunction(item))
        {
            loadObj = item(db);
        }
        else
        {
            loadObj = item;
        }
       for (var key in loadObj)
       {
           platFunction[key] = loadObj[key];
       }
    });

    return {
        'getTask' : getTask,
        'createTask' : createTask,
    };
};
