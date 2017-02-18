var fs = require('fs');

function loadConfig() {
    /* 加载公共配置文件 */
    if (fs.existsSync('../config'))
    {
        console.error("not found ../" + part + "/config.js");
        process.exit(0);
    }

    var common = require('../config');

    /* 加载特定配置文件 */
    if (fs.existsSync('../' + part + '/config'))
    {
        console.error("not found ../" + part + "/config.js");
        process.exit(0);
    }

    var total = require('../' + part + '/config');

    /* 合并配置文件 */
    for (var index in common)
        total[index] = common[index];

    return total;
}

module.exports = loadConfig;