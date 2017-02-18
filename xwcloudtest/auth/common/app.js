global.auth = {status : 'idle'}

function setStatus(status)
{
    auth.status = status;
}

function getStatus()
{
    return auth.status;
}

module.exports = {
    'setStatus' : setStatus,
    'getStatus' : getStatus
  };
