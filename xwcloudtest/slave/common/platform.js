var os = require('os');

function getPlatformLib()
{
    var platform = undefined;

    if (config.sim_slave && config.real_slave)
    {
        console.log('Please choose one. sim slave or real slave.');
        process.exit(-1);
    }
    
    if (config.sim_slave)
    {
        platform = 'sim';
    }
    else
    {
        platform = 'real';
    }

    return platform;
}

module.exports = getPlatformLib;