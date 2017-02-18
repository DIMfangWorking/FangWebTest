var fs = require('fs');
var pathModule = require('path');

function autoLoadModuleReal(path, floor, handleFile) {
    handleFile(path, floor);
    floor++;
    files = fs.readdirSync(path)

    files.forEach(function(item) {
        var tmpPath = path + '/' + item;
        stats = fs.statSync(tmpPath)
        if (stats.isDirectory()) {
            autoLoadModuleReal(tmpPath, floor, handleFile);
        } else {
            handleFile(tmpPath, floor);
        }
    });
}

function handleFile(path, floor) {
    var stats = fs.statSync(path);
    if (stats.isFile())
    {
        var moduleName = pathModule.basename(path, '.js');
        if (moduleName === 'app')
            return;
        if (pathModule.extname(path) != '.js')
            return;
        var load = require(path);
        autoLoadModule.loadArray.push(load);
    }
}

autoLoadModule.loadArray = new Array();
function autoLoadModule(path)
{
    autoLoadModule.loadArray = new Array();
    autoLoadModuleReal(path, 0, handleFile);
    return autoLoadModule.loadArray;
}

//global.autoLoadModule = autoLoadModule;

module.exports = autoLoadModule;