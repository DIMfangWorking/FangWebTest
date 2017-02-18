global.web = {status : 'fault'}

function setStatus(status)
{
    web.status = status;
}

function getStatus()
{
    return web.status;
}

module.exports = {
    'setStatus' : setStatus,
    'getStatus' : getStatus
  };
