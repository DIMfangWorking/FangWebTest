var statusMachine = require('../common/app');
global.MasterStore = undefined;

function MasterLostTimeout()
{
    logger.error("master lost. ip : ", MasterStore.ip);
    
    MasterStore.status = STATUS_LOST;
    statusMachine.setStatus('fault');
}

function updateMaster(master)
{
    if (MasterStore && MasterStore.timerObject)
    {
        clearTimeout(MasterStore.timerObject);
    }

    for (var item in master)
    {
        MasterStore[item] = master[item];
    }

    MasterStore.status = STATUS_NORMAL;
    statusMachine.setStatus('normal');

    MasterStore.timerObject = setTimeout(MasterLostTimeout, config.web.master_heartbeat_timeout * 1000);
}

function saveMaster(master)
{
    if (MasterStore && MasterStore.timerObject)
    {
        clearTimeout(MasterStore.timerObject);
    }

    MasterStore = master;
    MasterStore.id = 1;
    MasterStore.timeoutCount = 0;
    MasterStore.status = STATUS_NORMAL;

    MasterStore.timerObject = setTimeout(MasterLostTimeout, config.web.master_heartbeat_timeout * 1000);

    statusMachine.setStatus('normal');
}

function getMaster()
{
    return MasterStore;
}

module.exports = function (db) {
    return {
        'saveMaster' : saveMaster,
        'updateMaster' : updateMaster,
        'getMaster' : getMaster,
    };
}